from lib.database.db_tools import X509Database
from lib.cert_tools import X509Cert

SIGNATURE = """IRJCJu3WCy3nHW4lyJGsHnG+COu0gubws1wN7gNxUB56oPPHrkJS0dX3q8+L59MjvS0dm+ccqUuN
k4F9g+oUWZGCu1kH38EzBVdGnQ0t4r+Q4cy5rdlwEMcEwhV0X5OdYOWjmVU2pdze/j8yIQH4OGva
lokI+XgFuFP7c9bER/65+UK/qxlCcqOebfbe35Tt1w2K6MfTeiJoIlIO9LGFjXVM3VyTd5H1D/Od
0vp+RzJMlIBK1Jb15NfNiYkoM0BdfeSbS1Uk4UyojKRj2jEdAxYd6pLjUUvY4ZYiZCIFfWLheXVY
CDuc8XYSjW+hfU8XWYuGjnL+umEv6WdS7KjMFw==
"""

PUB_KEY = """-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqSMhacEemu3LNy5znTH7
SxKeymotLIAh9yyneVm03VLUu6m47IRBa/IZ4pskQeLjZ/00IJFM2TpoD8BsbP/A
2SMZYq80IJWMTMfditMmr/A2GxSmoir0LXgMGm6JkRPu/qK/gOpoXn1gQjjdY18A
GNzBS4dzvsJdnW/lzdeeRbwOoYZ/jiUaZa2B86t8nj9Kbh7JjuaNuJf2SsdEo3dg
04uNzqn8oh+aDEAOw2O6QjsJYr1SRLzdO6uOMRZLPzl//pB3bpr15CLeWNsQS0ji
oHNXKm4abIT5QkZjskF4ymXL/OXCG4C67pFYxSwb+3m5C/Qrn86swoHMqmsfdkEc
cQIDAQAB
-----END PUBLIC KEY-----
"""

CERTIFICATE = """
-----BEGIN CERTIFICATE-----
MIIDuzCCAqOgAwIBAgIUMZ/hZXjTMxnUQvvzf5+SO2h/TF0wDQYJKoZIhvcNAQEL
BQAwbTELMAkGA1UEBhMCQlIxFzAVBgNVBAgMDkVzcGlyaXRvIFNhbnRvMRAwDgYD
VQQHDAdWaXRvcmlhMRYwFAYDVQQKDA1NaW5oYSBFbXByZXNhMRswGQYDVQQDDBJq
b2FvY2xldmVsYXJlcy5jb20wHhcNMjQwODEyMTgyNDM1WhcNMjUwODEyMTgyNDM1
WjBtMQswCQYDVQQGEwJCUjEXMBUGA1UECAwORXNwaXJpdG8gU2FudG8xEDAOBgNV
BAcMB1ZpdG9yaWExFjAUBgNVBAoMDU1pbmhhIEVtcHJlc2ExGzAZBgNVBAMMEmpv
YW9jbGV2ZWxhcmVzLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEB
AKkjIWnBHprtyzcuc50x+0sSnspqLSyAIfcsp3lZtN1S1LupuOyEQWvyGeKbJEHi
42f9NCCRTNk6aA/AbGz/wNkjGWKvNCCVjEzH3YrTJq/wNhsUpqIq9C14DBpuiZET
7v6iv4DqaF59YEI43WNfABjcwUuHc77CXZ1v5c3XnkW8DqGGf44lGmWtgfOrfJ4/
Sm4eyY7mjbiX9krHRKN3YNOLjc6p/KIfmgxADsNjukI7CWK9UkS83TurjjEWSz85
f/6Qd26a9eQi3ljbEEtI4qBzVypuGmyE+UJGY7JBeMply/zlwhuAuu6RWMUsG/t5
uQv0K5/OrMKBzKprH3ZBHHECAwEAAaNTMFEwHQYDVR0OBBYEFI8hV+V9C3x5+OSJ
OeXs6Dp+5SZiMB8GA1UdIwQYMBaAFI8hV+V9C3x5+OSJOeXs6Dp+5SZiMA8GA1Ud
EwEB/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBACwuAM+8XqP5kzIQK4lRQfIU
NoIRSBjX+/AxDPX/OSE06pryWtf6aV49xhFQ/SRtAKUNJ9sZZzNlWmkaGKU+Rk9c
ykVlZPKxIDiRkOrXAfRLjfSK+PeETIeMkQSIjct+r0VCwGfFLhUuZorL7cVuEzg5
BsPBnjV58NjTUnfdIcoT9prQ2QaLbwh9wsANYNRIH6/f45BHmUR6v80xhXJubQah
HZ3Uf5GimPwSfx1HRnVmPp+NxfDMRePrdjSNQqBehn/92j2TM6Z7Il5aqPg1Axnh
v01OTYrFPFGVUcpBXkSNJnRRUWa3V9GgLysTTgxUpt/wa/826L6UDfN0cQl8Mmw=
-----END CERTIFICATE-----
"""

# Operations
OP1="$REGISTER$"
OP2="$REVOKE$"
OP3 = 3
operation = OP2

# Constants
DB_PATH = "certs.db"
DB_EXISTS = False
REVOKE_MSG = "revocation"


#======================================ADVANCE===============================#
# Register======================#
if operation == OP1:
  try:  
    # New cert instance
    cert = X509Cert(CERTIFICATE)
    db = X509Database(DB_PATH)

    # Checking validation
    if cert.is_valid():
      # Checking if the table is there
      if not DB_EXISTS:   
        db.create_table()
        DB_EXISTS = True

      # Inserting new certificate
      issuer = cert.get_issuer()
      v_dates = cert.get_dates()
      data = {
        "id": cert.get_serial(),
        "raw_cert": CERTIFICATE,
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
  
  except Exception as e:
    print(e)


# Revocation========#
if operation == OP2:
  try:
    if X509Cert.check_sign(REVOKE_MSG, SIGNATURE, PUB_KEY):
      db = X509Database(DB_PATH)
      db.revoke_cert(PUB_KEY)
    else:
      raise Exception("The signature is not valid ")
  except Exception as e:
    print(e)


#========================================INSPECT=========================#
if operation == OP3:
  try: 
    db = X509Database(DB_PATH)
    result = dict(zip(X509Database.get_model(), db.query_cert(PUB_KEY)))
    print(result)
  except Exception as e:
    print(e)
