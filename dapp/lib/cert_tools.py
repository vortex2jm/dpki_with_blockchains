from datetime import datetime
from os import system
import subprocess

BASE_PATH = "./tmp/"

class X509Cert():
  __MSG_PATH = f"{BASE_PATH}msg.txt"
  __PUBKEY_PATH = f"{BASE_PATH}public_key.pem"
  __SIGNATURE_B64PATH = f"{BASE_PATH}signature.b64"
  __SIGNATURE_BINPATH = f"{BASE_PATH}signature.bin"
  __DECODE_COMMAND = f"base64 -d {__SIGNATURE_B64PATH} > {__SIGNATURE_BINPATH}"
  __CHECK_SIGN_COMMAND = f"openssl dgst -sha256 -verify {__PUBKEY_PATH} -signature {__SIGNATURE_BINPATH} {__MSG_PATH}"

  def __init__(self, cert: str) -> None:
    self.__certificate = cert
    self.__CERT_PATH = f"{BASE_PATH}certificate.pem"
    self.__DATES_COMMAND = f"openssl x509 -in {self.__CERT_PATH} -noout -dates"
    self.__SERIAL_COMMAND = f"openssl x509 -in {self.__CERT_PATH} -noout -serial"
    self.__PUBKEY_COMMAND = f"openssl x509 -in {self.__CERT_PATH} -noout -pubkey"
    self.__ISSUER_COMMAND = f" openssl x509 -in {self.__CERT_PATH} -noout -issuer"
    self.__VALIDATION_COMMAND = f"openssl verify -CAfile {self.__CERT_PATH} {self.__CERT_PATH}"
    self.__create_file()

  #===============================
  def __create_file(self) -> None:
    try:
      with open(self.__CERT_PATH, "w") as cert_file:
        cert_file.write(self.__certificate)
    except:
      raise Exception("Error creating certificate file!")

  #===========================
  def get_serial(self) -> str:
    try:
      output = subprocess.check_output(self.__SERIAL_COMMAND, shell=True, text=True)
      _,_,serial = output.partition("=")
      return serial
    except subprocess.CalledProcessError as e:
      raise Exception(f"get_serial error\nCommand exec error: {e.output}")
  
  #===========================
  def get_pubkey(self) -> str:
    try:
      output = subprocess.check_output(self.__PUBKEY_COMMAND, shell=True, text=True)
      return output
    except subprocess.CalledProcessError as e:
      raise Exception(f"get_pubkey error\nCommand exec error: {e.output}")
    
  #============================
  def get_issuer(self) -> dict:
    try:
      output = subprocess.check_output(self.__ISSUER_COMMAND, shell=True, text=True)
      output = output.replace("issuer=", "").strip().split(", ")
      output = dict(element.split(" = ") for element in output)
      return output
    except subprocess.CalledProcessError as e:
      raise Exception(f"get_issuer error\nCommand exec error: {e.output}")

  #===========================
  def get_dates(self) -> dict:
    try:
      output = subprocess.check_output(self.__DATES_COMMAND, shell=True, text=True)
      output = output.replace("notBefore=","").replace("notAfter=","").strip()
      nbefore,_,nafter = output.partition("\n")
      d_format = "%b %d %H:%M:%S %Y GMT"
      return {
        "not_before": datetime.strptime(nbefore, d_format), 
        "not_after": datetime.strptime(nafter, d_format)
      }
    except subprocess.CalledProcessError as e:
      raise Exception(f"get_dates error\nCommand exec error: {e.output}")

  #==========================
  def is_valid(self) -> bool: 
    try:
      output = subprocess.check_output(self.__VALIDATION_COMMAND, shell=True, text=True)
      return " OK\n" in output
    except subprocess.CalledProcessError as e:
      raise Exception(f"validation error\nCommand exec error: {e.output}")

  #===========================#
  @classmethod
  def check_sign(cls, msg, signature, pub_key):
    try:
      with open(cls.__MSG_PATH, "w") as msg_file:
        msg_file.write(msg+"\n")

      with open(cls.__SIGNATURE_B64PATH, "w") as signature_file:
        signature_file.write(signature+"\n")

      with open(cls.__PUBKEY_PATH, "w") as pubkey_file:
        pubkey_file.write(pub_key+"\n")

      system(cls.__DECODE_COMMAND)
      
      output = subprocess.check_output(cls.__CHECK_SIGN_COMMAND, shell=True, text=True)
      return " OK\n" in output

    except subprocess.CalledProcessError as e:
      raise Exception(f"check sign error\nCommand exec error: {e.output}")
