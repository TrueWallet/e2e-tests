#!/bin/bash
DEV_ACCOUNT=$(cast rpc eth_accounts | tail -n 1 | tr -d '[]"')
BUNDLER_ACCOUNT=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
DEPLOYER_ACCOUNT=0x7850cc10aC0Ea9C7d91848a1B4629E686E5Db302
DEPLOYER_PK=0x800a2034d6af44b31f17e6a4f646f9b29896c40cc7dbc9bbc2d2761725a93e0f

cast send --unlocked --from $DEV_ACCOUNT --value 1ether $BUNDLER_ACCOUNT > /dev/null
cast send --unlocked --from $DEV_ACCOUNT --value 1ether $DEPLOYER_ACCOUNT > /dev/null

cd ./account-abstraction &&
  yarn install &&
  yarn deploy --network localhost

cd ..

cd ./contracts &&
  rm -f .env &&
  echo "OWNER=$DEPLOYER_ACCOUNT" > .env &&
  echo "PRIVATE_KEY_TESTNET=$DEPLOYER_PK" >> .env &&
  source .env &&
  forge install &&
  yarn deployFull:local
