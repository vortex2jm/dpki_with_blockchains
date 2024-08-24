# Este arquivo implementa a logica para lidar com solicitacoes de advance e inspect de um ambiente Cartesi,
# utilizando certificados X.509 e interacoes com um db SQLite.
from lib.database.db_tools import X509Database
from lib.cert_tools import X509Cert
from datetime import datetime
from os import environ
import requests
import logging
import subprocess
import json

DB_PATH = "certs.db"  # Caminho do banco de dados SQLite onde os certificados serao armazenados

#==============================
# Configuracao de logging para registrar informacoes durante a execucao do script
logging.basicConfig(level="INFO")
logger = logging.getLogger(__name__)
rollup_server = environ["ROLLUP_HTTP_SERVER_URL"] # URL do servidor de rollups obtido das variaveis de ambiente
logger.info(f"HTTP rollup_server url is {rollup_server}")


#Encode/Decode================
# Funcoes de utilidade para converter entre strings e hexadecimais
def hex2str(hex):
    return bytes.fromhex(hex[2:]).decode("utf-8")
#================
def str2hex(str):
    return "0x" + str.encode("utf-8").hex()


#============================ADVANCE========================
# Funcao que lida com a solicitacao de um advance
def handle_advance(data):

    logger.info(f"Received advance request data {data}")
    input_data = hex2str(data["payload"]).replace("$", "\n") # Decodifica o payload recebido
    logger.info(f"Received input: {input_data}")
    logger.info(f"HORÁRIO ATUAL: {datetime.now()}")
    
    data = json.loads(input_data) # Converte o input de JSON para um dicionario Python

    if data['fl_revoke'] == 0: # Verifica se a solicitacao eh para registrar um novo certificado
        try:
            cert = X509Cert(data['cert'])
            db = X509Database(DB_PATH)
            
            if cert.is_valid():  # Verifica se o certificado eh valido
                db.create_table() # Cria a tabela no banco de dados, se nao existir
                issuer = cert.get_issuer() # Obtem os dados do emissor do certificado
                v_dates = cert.get_dates() # Obtem as datas de validade do certificado
                data = {
                "id": cert.get_serial(),
                "raw_cert": data['cert'],
                "public_key": cert.get_pubkey(),
                "country": issuer['C'],
                "state": issuer['ST'],
                "locality": issuer['L'],
                "organization": issuer['O'],
                "common_name": issuer['CN'],
                "active": 1,
                "generation_date": v_dates['not_before'],
                "expiration_date": v_dates['not_after']
                }            
                db.add_cert(tuple(data.values())) # Adiciona o certificado ao banco de dados

                logger.info(f"Adding notice")
                response = requests.post(rollup_server + "/notice", json={"payload": str2hex(str("Certificate registered"))})
                logger.info(f"Received notice status {response.status_code} body {response.content}")
                return "accept" 
            
            raise Exception("The certificate is not valid")

        except Exception as e: # Trata erros ocorridos durante o processo de registro
            logger.info("Adding report")
            response = requests.post(rollup_server + "/report", json={"payload": str2hex(str(e))})
            logger.info(f"Received report status {response.status_code}")
            return "reject"
    else: # Se fl_revoke eh 1, a solicitacao eh para revogar um certificado
        try:            
            if X509Cert.check_sign(data['message'], data['signed_message'], data['public_key']):
                db = X509Database(DB_PATH)
                db.revoke_cert(data['public_key']) # Revoga o certificado no banco de dados
                
                logger.info("Certificado revogado com sucesso")
                response = requests.post(rollup_server + "/notice", json={"payload": str2hex(str("Certificate revoked"))})
                logger.info(f"Received notice status {response.status_code}")
                return "accept"
            else:
                raise Exception("A mensagem assinada não corresponde à mensagem original")                          

        except Exception as e: # Trata erros ocorridos durante o processo de revogacao
            logger.info("Adding report")
            response = requests.post(rollup_server + "/report", json={"payload": str2hex(str(e))})
            logger.info(f"Received report status {response.status_code}")
            return "reject"


#========================INSPECT============================#
# Funcao que lida com a solicitacao de inspect
def handle_inspect(data):
    logger.info(f"Received inspect request data {data}")
    input_data = hex2str(data["payload"]).replace("$", "\n").replace("~", " ").replace("!", "/") # Decodifica e formata o payload
    logger.info(f"Received parameter: {input_data}")

    try:    
        db = X509Database(DB_PATH)
        result = dict(zip(X509Database.get_model(), db.query_cert(input_data))) # Consulta o certificado no banco de dados
        logger.info("Adding report")
        response = requests.post(rollup_server + "/report", json={"payload": str2hex(str(result))}) # Envia o resultado como relatório
        logger.info(f"Received report status {response.status_code}")
        return "accept"
    except Exception as e: # Trata erros ocorridos durante o inspect
        logger.info("Adding report")
        response = requests.post(rollup_server + "/report", json={"payload": str2hex(str(e))})
        logger.info(f"Received report status {response.status_code}")
        return "reject"
    

#=================================
# Dicionario de mapeamento de handlers para diferentes tipos de solicitacoes
handlers = {
    "advance_state": handle_advance,
    "inspect_state": handle_inspect,
}
finish = {"status": "accept"}


# Updating time==================
# Atualizando a data e hora do sistema
date_str = "20 JAN 2025 12:00:00"
try:
    subprocess.run(['sudo', 'date', '-s', date_str], check=True)
    print(f"Adjusting datetime: {date_str}")
except subprocess.CalledProcessError as e:
    print(f"Datetime updating error: {e}")

result = subprocess.run(['date'], capture_output=True, text=True).stdout.strip()
print(f"Current system time: {result}")
#==============================================================================


# MAIN LOOP=======================
# Loop principal que processa solicitacoes pendentes de rollups continuamente
while True:
    logger.info("Sending finish")
    response = requests.post(rollup_server + "/finish", json=finish)
    logger.info(f"Received finish status {response.status_code}")
    if response.status_code == 202: # Verifica se nao ha solicitacoes pendentes
        logger.info("No pending rollup request, trying again")
    else:
        rollup_request = response.json()
        data = rollup_request["data"]
        handler = handlers[rollup_request["request_type"]] # Seleciona o handler apropriado com base no tipo de solicitacao
        finish["status"] = handler(rollup_request["data"]) # Processa a solicitacao e atualiza o status
