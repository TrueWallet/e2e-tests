const {init, BundlerError} = require("../deps/js-sdk/dist/node/cjs");
const ethers = require("ethers");

describe('Wallet methods', () => {
  let owner;
  let sdk;
  let tankWallet;

  beforeAll(async () => {
    owner = ethers.Wallet.createRandom();
    sdk = await init({
      rpcProviderUrl: 'http://127.0.0.1:8545',
      bundlerUrl: 'http://127.0.0.1:3000',
      signer: {type: 'privateKey', data: [owner.privateKey]},
    });

    const provider = new ethers.JsonRpcProvider();
    tankWallet = await provider.getSigner();
  });

  test('deployWallet when balance is 0', async () => {
    const deploy = sdk.deployWallet();
    expect(deploy).rejects.toThrow(BundlerError);
  });

  test('deployWallet success', async () => {
    const tx = await tankWallet.sendTransaction({to: sdk.address, value: ethers.parseEther('1')});
    await tx.wait();

    const deploy = await sdk.deployWallet();
    await deploy.wait();

    const deployed = await sdk.isWalletReady();
    expect(deployed).toBe(true);
  }, 10_000);
});
