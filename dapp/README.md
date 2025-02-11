## dApp

### Overview
This backend will run into cartesi machine handling **advance** and **inspect** operations.
 - The advance receives the blockchain inputs as parameter, change the machine state and return notices to the client. 
 - The inspect receives requests directly from the client to return the application status without changing machine state.

### Usage
Firstly sure you've already installed Docker and NodeJs:

Install Docker RISC-V image support:
```shell
docker run --privileged --rm tonistiigi/binfmt --install all
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

### Optional and Utilities

Checking logs
```shell
cartesi run --verbose
```

Changing block generation time
```shell
cartesi run --block-time <seconds>
```

Checking environment variables from **advance runner**
```shell
docker run -ti --rm cartesi/rollups-node:1.5.0 cartesi-rollups-advance-runner --help
```
> [!NOTE]
> These variables can be changed by .cartesi.env file

Changing the machine's memory
```dockerfile
LABEL io.cartesi.rollups.ram_size=128Mi
```
