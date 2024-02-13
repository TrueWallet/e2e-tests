const {initTrueWallet, BundlerError, TrueWalletError, TrueWalletErrorCodes} = require("../deps/js-sdk/dist/cjs");
const ethers = require("ethers");

describe('Wallet methods', () => {
  let owner;
  let sdk;
  let tankWallet;

  beforeAll(async () => {
    const provider = new ethers.JsonRpcProvider();
    tankWallet = await provider.getSigner();
  });

  beforeEach(async () => {
    owner = ethers.Wallet.createRandom();
    sdk = await initTrueWallet({
      rpcProviderUrl: 'http://127.0.0.1:8545',
      bundlerUrl: 'http://127.0.0.1:3000',
      signer: {type: 'privateKey', data: [owner.privateKey]},
    });
  });

  test('deployWallet when balance is 0', async () => {
    const deploy = sdk.deployWallet();
    expect(deploy).rejects.toThrow(BundlerError);
  });

  test('deployWallet', async () => {
    const tx = await tankWallet.sendTransaction({to: sdk.address, value: ethers.parseEther('1')});
    await tx.wait();

    const deployed1 = await sdk.isWalletReady();
    expect(deployed1).toBe(false);

    const deploy = await sdk.deployWallet();
    await deploy.wait();

    const deployed2 = await sdk.isWalletReady();
    expect(deployed2).toBe(true);
  }, 15_000);

  test('send when not deployed', async () => {
    const tx = await tankWallet.sendTransaction({to: sdk.address, value: ethers.parseEther('1')});
    await tx.wait();

    const deployed1 = await sdk.isWalletReady();
    expect(deployed1).toBe(false);

    const deploy = await sdk.send({to: tankWallet.address, amount: '0.1'});
    await deploy.wait();

    const deployed2 = await sdk.isWalletReady();
    expect(deployed2).toBe(true);
  }, 15_000);

  test('send when deployed', async () => {
    const tx = await tankWallet.sendTransaction({to: sdk.address, value: ethers.parseEther('1')});
    await tx.wait();

    const deploy = await sdk.deployWallet();
    await deploy.wait();

    const balance1 = await sdk.getBalance();

    const send = await sdk.send({to: tankWallet.address, amount: '0.1'});
    await send.wait();

    const balance2 = await sdk.getBalance();

    expect(Number(balance2)).toBeLessThan(Number(balance1) - 0.1);
  }, 15_000);

  test('getBalance', async () => {
    const balance1 = await sdk.getBalance();
    expect(balance1).toBe("0.0");

    const tx = await tankWallet.sendTransaction({to: sdk.address, value: ethers.parseEther('1')});
    await tx.wait();

    const balance2 = await sdk.getBalance();
    expect(balance2).toBe("1.0");
  });

  test('getNonce when not deployed', async () => {
    const nonce = sdk.getNonce();
    expect(nonce).rejects.toThrow(TrueWalletError);

    sdk.getNonce().catch(err => {
      expect(err.code).toBe(TrueWalletErrorCodes.WALLET_NOT_READY);
    });
  });

  test('getNonce when deployed', async () => {
    const tx = await tankWallet.sendTransaction({to: sdk.address, value: ethers.parseEther('1')});
    await tx.wait();

    const deploy = await sdk.deployWallet();
    await deploy.wait();

    const nonce1 = await sdk.getNonce();
    expect(nonce1).toBe(1n);

    const send = await sdk.send({to: tankWallet.address, amount: '0.1'});
    await send.wait();

    const nonce2 = await sdk.getNonce();
    expect(nonce2).toBe(2n);
  }, 15_000);

  test('getInstalledModules when not deployed', async () => {
    const modules = sdk.getInstalledModules();
    expect(modules).rejects.toThrow(TrueWalletError);

    sdk.getNonce().catch(err => {
      expect(err.code).toBe(TrueWalletErrorCodes.WALLET_NOT_READY);
    });
  });

  test('getInstalledModules when deployed', async () => {
    const tx = await tankWallet.sendTransaction({to: sdk.address, value: ethers.parseEther('1')});
    await tx.wait();

    const deploy = await sdk.deployWallet();
    await deploy.wait();

    const [modules] = await sdk.getInstalledModules();
    const securityModule = sdk.getModuleAddress('SecurityControlModule');
    expect(modules).toEqual([securityModule]);
  }, 15_000);

  test('getModuleAddress', async () => {
    const securityModule = await sdk.getModuleAddress('SecurityControlModule');
    expect(securityModule).not.toBeFalsy();

    const recoveryModule = await sdk.getModuleAddress('SocialRecoveryModule');
    expect(recoveryModule).not.toBeFalsy();
  });

  test('isWalletOwner when not deployed', async () => {
    const isOwner = sdk.isWalletOwner(owner.address);
    expect(isOwner).rejects.toThrow(TrueWalletError);
  });

  test('isWalletOwner when deployed', async () => {
    const tx = await tankWallet.sendTransaction({to: sdk.address, value: ethers.parseEther('1')});
    await tx.wait();

    const deploy = await sdk.deployWallet();
    await deploy.wait();

    const isOwner1 = await sdk.isWalletOwner(owner.address);
    expect(isOwner1).toBe(true);

    const isOwner2 = await sdk.isWalletOwner(tankWallet.address);
    expect(isOwner2).toBe(false);
  }, 15_000);
});
