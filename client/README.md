## DPKI client

This is a **web3** client to communicate with dApp :gear:

The code has been extended and adapted from the [template](https://github.com/prototyp3-dev/frontend-web-cartesi?_gl=1*1o93xk9*_ga*MTUwNjA4MjQ1OC4xNzE3MDE1MjIz*_ga_HM92STPNFJ*MTcyMzE0MzAwOC4xNi4xLjE3MjMxNDMwMjAuNDguMC4w*_gcl_au*MjEzNTg1Mjg4NC4xNzE3MDE1MjIz) provided by Cartesi.

#

### Usage
This client provides an interface to register, inspect and revoke digital certificates. 

 - **Register**
First, you must generate a new certificate yourself using the commands shown below. Then, load the **.pem** certificate file into the interface and send it to the dapp. The client will return a response indicating whether the process was successful.

 - **Inspect**
For this operation, you will load your public key **.pem** file into the interface and send it to the dapp. The client will return the certificate corresponding to the public key or an error if none is registered.

 - **Revoke**
Here you first need to sign a message with your private key. The message can be of your choice as long as it meets the requirements specified in the message field of the interface. You will also need your public key and the original message. Therefore, load the **.pem** file of the public key, and the **.b64** file of the signed message, type the original message in the corresponding field, and send it to the dapp.

#

### Util

Creating a private key using openSSL
```shell
openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048
```

Generating the self-signed certificate
```shell
openssl req -x509 -new -key private_key.pem -out certificate.pem -days 365 -subj "/C=BR/ST=São Paulo/L=São Paulo/O=Minha Empresa/CN=meuexemplo.com"
```

> [!NOTE] 
> Remember to update the following fields
> - C=BR (Country).
> - ST=São Paulo (State).
> - L=São Paulo (Locality).
> - O=Minha Empresa (Organization).
> - CN=meuexemplo.com (Common Name).

<br>

Getting the public key
```shell
openssl pkey -in private_key.pem -pubout -out public_key.pem
```

> [!NOTE]  
> Don't share your private key

<br>

Checking the certificate
```shell
openssl x509 -in certificate.pem -text -noout
```

Signing a message (save the message into a .txt file)
```shell
openssl dgst -sha256 -sign private_key.pem -out signature.bin message.txt
```

Converting the message to base64
```shell
base64 signature.bin > signature.b64
```

#

### Running
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

### Remarks
> [!NOTE]
> To use the client, you need to install the MetaMask wallet for Chrome and add the test account with the mnemonic: **test test test test test test test test test test test junk**.
> Once connected, manually add the local network:
>  - New RPC URL: http://localhost:8545
>  - Chain ID: 31337
>  - Currency symbol: ETH
