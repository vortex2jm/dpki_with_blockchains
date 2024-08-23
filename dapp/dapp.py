from lib.database.db_tools import X509Database
from lib.cert_tools import X509Cert
from datetime import datetime
from os import environ
import requests
import logging
import subprocess
import json

DB_PATH = "certs.db"

#==============================
logging.basicConfig(level="INFO")
logger = logging.getLogger(__name__)
rollup_server = environ["ROLLUP_HTTP_SERVER_URL"]
logger.info(f"HTTP rollup_server url is {rollup_server}")


#Encode/Decode================
def hex2str(hex):
    return bytes.fromhex(hex[2:]).decode("utf-8")
#================
def str2hex(str):
    return "0x" + str.encode("utf-8").hex()


#============================ADVANCE========================
def handle_advance(data):

    logger.info(f"Received advance request data {data}")
    input_data = hex2str(data["payload"]).replace("$", "\n")
    logger.info(f"Received input: {input_data}")
    logger.info(f"HORÁRIO ATUAL: {datetime.now()}")
    
    data = json.loads(input_data)

    if data['fl_revoke'] == 0:
        try:
            cert = X509Cert(data['cert'])
            db = X509Database(DB_PATH)
            
            if cert.is_valid():
                db.create_table()
                issuer = cert.get_issuer()
                v_dates = cert.get_dates()
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
                db.add_cert(tuple(data.values()))

                logger.info(f"Adding notice")
                response = requests.post(rollup_server + "/notice", json={"payload": str2hex(str("Certificate registered"))})
                logger.info(f"Received notice status {response.status_code} body {response.content}")
                return "accept" 
            
            raise Exception("The certificate is not valid")

        except Exception as e:
            logger.info("Adding report")
            response = requests.post(rollup_server + "/report", json={"payload": str2hex(str(e))})
            logger.info(f"Received report status {response.status_code}")
            return "reject"
    else:
        try:            
            if X509Cert.check_sign(data['message'], data['signed_message'], data['public_key']):
                db = X509Database(DB_PATH)
                db.revoke_cert(data['public_key'])
                
                logger.info("Certificado revogado com sucesso")
                response = requests.post(rollup_server + "/notice", json={"payload": str2hex(str("Certificate revoked"))})
                logger.info(f"Received notice status {response.status_code}")
                return "accept"
            else:
                raise Exception("A mensagem assinada não corresponde à mensagem original")                          

        except Exception as e:
            logger.info("Adding report")
            response = requests.post(rollup_server + "/report", json={"payload": str2hex(str(e))})
            logger.info(f"Received report status {response.status_code}")
            return "reject"


#========================INSPECT============================#
def handle_inspect(data):
    logger.info(f"Received inspect request data {data}")
    input_data = hex2str(data["payload"]).replace("$", "\n").replace("~", " ").replace("!", "/")
    logger.info(f"Received parameter: {input_data}")

    try:    
        db = X509Database(DB_PATH)
        result = dict(zip(X509Database.get_model(), db.query_cert(input_data)))
        logger.info("Adding report")
        response = requests.post(rollup_server + "/report", json={"payload": str2hex(str(result))})
        logger.info(f"Received report status {response.status_code}")
        return "accept"
    except Exception as e:
        logger.info("Adding report")
        response = requests.post(rollup_server + "/report", json={"payload": str2hex(str(e))})
        logger.info(f"Received report status {response.status_code}")
        return "reject"
    

#=================================
handlers = {
    "advance_state": handle_advance,
    "inspect_state": handle_inspect,
}
finish = {"status": "accept"}


# Updating time==================
date_str = "20 AUG 2024 12:00:00"
try:
    subprocess.run(['sudo', 'date', '-s', date_str], check=True)
    print(f"Data e hora ajustadas para: {date_str}")
except subprocess.CalledProcessError as e:
    print(f"Erro ao ajustar a data e hora: {e}")

result = subprocess.run(['date'], capture_output=True, text=True).stdout.strip()
print(f"HORARIO ATUAL DO SISTEMA: {result}")
#==============================================================================


# MAIN LOOP=======================
while True:
    logger.info("Sending finish")
    response = requests.post(rollup_server + "/finish", json=finish)
    logger.info(f"Received finish status {response.status_code}")
    if response.status_code == 202:
        logger.info("No pending rollup request, trying again")
    else:
        rollup_request = response.json()
        data = rollup_request["data"]
        handler = handlers[rollup_request["request_type"]]
        finish["status"] = handler(rollup_request["data"])
