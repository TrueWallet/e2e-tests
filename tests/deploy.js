const TrueWalletSDK = require("../js-sdk/dist/node/cjs");
const ethers = require("ethers");

const main = async () => {
  const tankPk = "0xa6624b2e807904cd3c46bff517911ab2992a3f7ff5b6279000acb10fd2d424fd";
  const provider = new ethers.JsonRpcProvider();
  const tankWallet = new ethers.Wallet(tankPk, provider);

  const sdk = await TrueWalletSDK.init({salt: 'test-1'});

  await tankWallet.sendTransaction({to: sdk.walletAddress, value: ethers.parseEther('1')});

  const deploy = await sdk.send('0x0000000000000000000000000000000000000000', '0.01');
};

(async () => {
  try {
    await main();
  } catch (e) {
    console.error(e);
  }
})();
