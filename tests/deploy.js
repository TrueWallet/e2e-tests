const TrueWalletSDK = require("../deps/js-sdk/dist/node/cjs");
const ethers = require("ethers");

const main = async () => {
  const tankPk = "0xa6624b2e807904cd3c46bff517911ab2992a3f7ff5b6279000acb10fd2d424fd";
  const provider = new ethers.JsonRpcProvider();
  const tankWallet = new ethers.Wallet(tankPk, provider);

  const sdk = await TrueWalletSDK.init({
    rpcProviderUrl: 'http://127.0.0.1:8545',
    bundlerUrl: 'http://127.0.0.1:3000',
    signer: {type: 'salt', data: ['test-1']},
  });

  await tankWallet.sendTransaction({to: sdk.address, value: ethers.parseEther('1')});

  const deploy = await sdk.send({to: '0x0000000000000000000000000000000000000000', amount: '0.01'});
  await deploy.wait();
};

(async () => {
  try {
    await main();
  } catch (e) {
    console.error(e);
  }
})();
