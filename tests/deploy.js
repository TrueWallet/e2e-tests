const TrueWalletSDK = require("../js-sdk/dist/node/cjs");

const main = async () => {
  const sdk = await TrueWalletSDK.init({salt: 'test-1'});
};

(async () => {
  try {
    await main();
  } catch (e) {
    console.error(e);
  }
})();
