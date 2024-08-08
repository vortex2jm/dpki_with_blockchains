## DPKI client

This is a **web3** client to communicate with dApp :gear:

The code has been extended and adapted from the [template](https://github.com/prototyp3-dev/frontend-web-cartesi?_gl=1*1o93xk9*_ga*MTUwNjA4MjQ1OC4xNzE3MDE1MjIz*_ga_HM92STPNFJ*MTcyMzE0MzAwOC4xNi4xLjE3MjMxNDMwMjAuNDguMC4w*_gcl_au*MjEzNTg1Mjg4NC4xNzE3MDE1MjIz) provided by Cartesi.

### Before using

Creating a self-signed digital certificate:
 - Create a private key using openSSL
```shell
openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048
```

 - Generate the self-signed certificate
```shell
openssl req -x509 -new -key private_key.pem -out certificate.pem -days 365 -subj "/C=BR/ST=São Paulo/L=São Paulo/O=Minha Empresa/CN=meuexemplo.com"
```

*Remember to update the information!*
 - C=BR (Country).
 - ST=São Paulo (State).
 - L=São Paulo (Locality).
 - O=Minha Empresa (Organization).
 - CN=meuexemplo.com (Common Name).

Then, if you wanna verify your certificate
```shell
openssl x509 -in certificate.pem -text -noout
```

### Usage
Installing dependencies
```shell
yarn
```

Generating resources
```shell
yarn codegen
```

Running
```shell
yarn start
```
