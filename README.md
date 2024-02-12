# <h1 align="center"> TrueWallet E2E Tests </h1>

<h3 align="center"> This repository contains end-to-end tests using Alchemy Bundler, TrueWallet smart contracts, and TrueWallet SDK </h3>

## Requirements

### Install dependencies
Make sure that you have installed `docker`, `docker compose`, `foundry`, `node`, and `yarn`.

**Pay attention: Node requires v18.**

* Install Docker: [installation guide](https://docs.docker.com/engine/install/)
* Install Docker Compose: [installation guide](https://docs.docker.com/compose/install/)
* Install Foundry and Forge: [installation guide](https://book.getfoundry.sh/getting-started/installation)
* Install Node: [installation guide](https://nodejs.org/en/download/package-manager)
* Install Yarn: [installation guide](https://classic.yarnpkg.com/en/docs/install)

### Change executable file permissions
```shell
chmod +x start.sh
```

### Pull latest repository and submodules
```shell
git submodule update --init --recursive
```

## Basic commands

### Run docker containers and setup prerequisites
```shell
docker-compose up -d && ./prepare.sh
```
or shortcut
```shell
make up
```
_It may take longer the first time_

### Run tests
```shell
node tests/deploy.js
```
or shortcut
```shell
make test
```

### Shutdown docker containers
```shell
docker-compose down
```
or shortcut
```shell
make down
```
