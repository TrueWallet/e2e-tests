#!/bin/bash
DEV_ACCOUNT=$(cast rpc eth_accounts | tail -n 1 | tr -d '[]"')
BUNDLER_ACCOUNT=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
DEPLOYER_ACCOUNT=0x7850cc10aC0Ea9C7d91848a1B4629E686E5Db302
DEPLOYER_PK=0x800a2034d6af44b31f17e6a4f646f9b29896c40cc7dbc9bbc2d2761725a93e0f

cast send --unlocked --from "$DEV_ACCOUNT" --value 10ether $BUNDLER_ACCOUNT > /dev/null
cast send --unlocked --from "$DEV_ACCOUNT" --value 10ether $DEPLOYER_ACCOUNT > /dev/null

cd ./account-abstraction &&
  yarn install &&
  yarn deploy --network localhost

cd ..

cd ./contracts &&
  rm -f .env &&
  echo "OWNER=$DEPLOYER_ACCOUNT" > .env &&
  echo "PRIVATE_KEY_TESTNET=$DEPLOYER_PK" >> .env &&
  forge install &&
  DEPLOYMENT_STDOUT=$(yarn deployFull:local 2>&1)

SECURITY_MODULE=$(echo "$DEPLOYMENT_STDOUT" | grep -E "==securityModule addr=0x[a-fA-F0-9]{40}$" | grep -oE "[a-fxA-F0-9]{42}$")
RECOVERY_MODULE=$(echo "$DEPLOYMENT_STDOUT" | grep -E "==recoveryModule addr=0x[a-fA-F0-9]{40}$" | grep -oE "[a-fxA-F0-9]{42}$")
FACTORY=$(echo "$DEPLOYMENT_STDOUT" | grep -E "==factory addr=0x[a-fA-F0-9]{40}$" | grep -oE "[a-fxA-F0-9]{42}$")

echo "Security module address $SECURITY_MODULE"
echo "Recovery module address $RECOVERY_MODULE"
echo "Factory address $FACTORY"
