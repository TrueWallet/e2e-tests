#!/bin/bash
DEV_ACCOUNT=$(cast rpc eth_accounts | tail -n 1 | tr -d '[]"')
BUNDLER_ACCOUNT=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
TRUEWALLET_DEPLOYER_ACCOUNT=0x7850cc10aC0Ea9C7d91848a1B4629E686E5Db302
TRUEWALLET_DEPLOYER_PK=0x800a2034d6af44b31f17e6a4f646f9b29896c40cc7dbc9bbc2d2761725a93e0f
# https://github.com/eth-infinitism/account-abstraction/blob/v0.6.0/src/Create2Factory.ts#L13
ENTRYPOINT_FACTORY_DEPLOYER_ACCOUNT=0x3fab184622dc19b6109349b94811493bf2a45362
# https://github.com/eth-infinitism/account-abstraction/blob/v0.6.0/src/Create2Factory.ts#L11
ENTRYPOINT_FACTORY_CONTRACT_ADDRESS=0x4e59b44847b379578588920ca78fbf26c0b4956c

cast send --unlocked --from "$DEV_ACCOUNT" --value 2ether $BUNDLER_ACCOUNT > /dev/null
cast send --unlocked --from "$DEV_ACCOUNT" --value 2ether $TRUEWALLET_DEPLOYER_ACCOUNT > /dev/null
cast send --unlocked --from "$DEV_ACCOUNT" --value 1ether $ENTRYPOINT_FACTORY_DEPLOYER_ACCOUNT > /dev/null

#########
# For what this workaround. There is no transaction wait here https://github.com/eth-infinitism/account-abstraction/blob/v0.6.0/src/Create2Factory.ts#L105 and as a result, the `account-abstraction` deployment script doesn't wait for the transaction receipt and starts checking if the contract was deployed. So, the first deployment will succeed, but the `account-abstraction` deployment script will fail. The contract address is known and we are waiting for when it will be deployed using the `cast code` and launch the `account-abstraction` deployment script again to complete the EntryPoint deployment
cd ./deps/account-abstraction &&
  yarn install &&
  AA_DEPLOYMENT_STDOUT=$(yarn deploy --network localhost 2>&1)

if [[ "$AA_DEPLOYMENT_STDOUT" == *"failed to deploy deterministic deployer"* ]]; then
  get_code=$(cast code $ENTRYPOINT_FACTORY_CONTRACT_ADDRESS)
  while [ "$get_code" == "0x" ]
  do
    get_code=$(cast code $ENTRYPOINT_FACTORY_CONTRACT_ADDRESS)
  done

  yarn install &&
    yarn deploy --network localhost
fi
#########

cd ../..

cd ./deps/contracts &&
  rm -f .env &&
  echo "OWNER=$TRUEWALLET_DEPLOYER_ACCOUNT" > .env &&
  echo "PRIVATE_KEY_TESTNET=$TRUEWALLET_DEPLOYER_PK" >> .env &&
  forge install &&
  DEPLOYMENT_STDOUT=$(yarn deploy:local 2>&1)

SECURITY_MODULE=$(echo "$DEPLOYMENT_STDOUT" | grep -E "==securityModule addr=0x[a-fA-F0-9]{40}$" | grep -oE "[a-fxA-F0-9]{42}$")
RECOVERY_MODULE=$(echo "$DEPLOYMENT_STDOUT" | grep -E "==recoveryModule addr=0x[a-fA-F0-9]{40}$" | grep -oE "[a-fxA-F0-9]{42}$")
FACTORY=$(echo "$DEPLOYMENT_STDOUT" | grep -E "==factory addr=0x[a-fA-F0-9]{40}$" | grep -oE "[a-fxA-F0-9]{42}$")
ERC20=$(echo "$DEPLOYMENT_STDOUT" | grep -E "==ERC20 addr=0x[a-fA-F0-9]{40}$" | grep -oE "[a-fxA-F0-9]{42}$")
ERC721=$(echo "$DEPLOYMENT_STDOUT" | grep -E "==ERC721 addr=0x[a-fA-F0-9]{40}$" | grep -oE "[a-fxA-F0-9]{42}$")
ERC1155=$(echo "$DEPLOYMENT_STDOUT" | grep -E "==ERC1155 addr=0x[a-fA-F0-9]{40}$" | grep -oE "[a-fxA-F0-9]{42}$")

echo "Security module address $SECURITY_MODULE"
echo "Recovery module address $RECOVERY_MODULE"
echo "Factory address $FACTORY"
echo "ERC20 address $ERC20"
echo "ERC721 address $ERC721"
echo "ERC1155 address $ERC1155"

cd ../..

cd ./deps/js-sdk &&
  rm -f .env &&
  echo "FACTORY=$FACTORY" >> .env &&
  echo "SECURITY_CONTROL_MODULE=$SECURITY_MODULE" >> .env &&
  echo "SOCIAL_RECOVERY_MODULE=$RECOVERY_MODULE" >> .env &&
  npm install &&
  npm run build

cd ../..

cd ./tests &&
  rm -f .env &&
  echo "ERC20=$ERC20" >> .env &&
  echo "ERC721=$ERC721" >> .env &&
  echo "ERC1155=$ERC1155" >> .env &&
  npm install
