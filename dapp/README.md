## dApp

### Overview
This backend will run into cartesi machine handling **advance** and **inspect** operations.
 - The advance receives the blockchain inputs as parameter, change the machine state and return notices to the client. 
 - The inspect receives requests directly from the client to return the application status without changing machine state.

### Usage
Firstly sure you've already installed Docker and NodeJs:

Install Docker RISC-V support:
```shell
 docker run --privileged --rm tonistiigi/binfmt:riscv
```

Then, install the cartesi CLI:
```shell
 npm i -g @cartesi/cli
```

Building application:
```shell
cartesi build
```

Runnning:
```shell
cartesi run
```
