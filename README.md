# <h1 align="center"> TrueWallet E2E Tests </h1>

<h3 align="center"> This repository contains end-to-end tests using Alchemy Bundler, TrueWallet smart contracts, and TrueWallet SDK </h3>

## Requirements

### Install dependencies
Make sure that you have installed `docker`, `docker compose`, `foundry`, `node` version 18 or below, and `yarn`.

* Install Docker: [installation guide](https://docs.docker.com/engine/install/)
* Install Docker Compose: [installation guide](https://docs.docker.com/compose/install/)
* Install Foundry and Forge: [installation guide](https://book.getfoundry.sh/getting-started/installation)
* Install Node: [installation guide](https://nodejs.org/en/download/package-manager)
* Install Yarn: [installation guide](https://classic.yarnpkg.com/en/docs/install)

### Change executable file permissions
```shell
sudo chmod +x start.sh
```

### Pull latest repository and submodules
```shell
git submodule update --init --recursive
```

## Basic commands

### Run docker containers
```shell
docker-compose up -d
```
or shortcut
```shell
make up
```

### Run tests
```shell
./start.sh
```
_It may take longer the first time_

### Shutdown docker containers
```shell
docker-compose down
```
or shortcut
```shell
make down
```

### Run docker containers, run tests, and then shutdown containers
```shell
docker-compose up -d
./start.sh
docker-compose down
```
or shortcut
```shell
make test
```

### Update latest repository and submodules
```shell
git pull --recurse-submodules
```
or shortcut
```shell
make pull
```
