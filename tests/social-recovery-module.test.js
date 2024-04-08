const {initTrueWallet} = require("../deps/js-sdk/dist/sdk.cjs");
const ethers = require("ethers");

describe('Social Recovery module', () => {
  let owner;
  let guardian;
  let sdk;
  let tankWallet;
  let provider;

  beforeAll(async () => {
      provider = new ethers.JsonRpcProvider();
      tankWallet = await provider.getSigner();
  });

  beforeEach(async () => {
    owner = ethers.Wallet.createRandom();
    guardian = ethers.Wallet.createRandom();
    sdk = await initTrueWallet({
      rpcProviderUrl: 'http://127.0.0.1:8545',
      bundlerUrl: 'http://127.0.0.1:3000',
      signer: {type: 'privateKey', data: [owner.privateKey]},
    });
    const tx = await tankWallet.sendTransaction({to: sdk.address, value: ethers.parseEther('1')});
    await tx.wait();
    const deploy = await sdk.deployWallet();
    await deploy.wait();
  }, 15_000);

  test('Social Recovery module is not installed', async () => {
    const isInstalled = await sdk.isModuleInstalled('SocialRecoveryModule');
    expect(isInstalled).toBe(false);
  });

  test('Social Recovery module installation', async () => {
    const operationResponse = await sdk.installModule('SocialRecoveryModule', {
      guardians: [guardian.address],
      threshold: 1,
    });
    await operationResponse.wait();

    const isInstalled = await sdk.isModuleInstalled('SocialRecoveryModule');
    expect(isInstalled).toBe(true);
  });

  test('Social Recovery module remove', async () => {
    const operationResponse1 = await sdk.installModule('SocialRecoveryModule', {
      guardians: [guardian.address],
      threshold: 1,
    });
    await operationResponse1.wait();

    const isInstalled1 = await sdk.isModuleInstalled('SocialRecoveryModule');
    expect(isInstalled1).toBe(true);

    const operationResponse2 = await sdk.removeModule('SocialRecoveryModule');
    await operationResponse2.wait();

    const isInstalled2 = await sdk.isModuleInstalled('SocialRecoveryModule');
    expect(isInstalled2).toBe(false);
  }, 15_000);

  test('Social Recovery module getGuardians', async () => {
    const operationResponse = await sdk.installModule('SocialRecoveryModule', {
      guardians: [guardian.address],
      threshold: 1,
    });
    await operationResponse.wait();

    const guardians = await sdk.socialRecoveryModule.getGuardians();
    expect(guardians).toEqual([guardian.address]);
  });

  test('Social Recovery module getGuardiansCount', async () => {
    const operationResponse = await sdk.installModule('SocialRecoveryModule', {
      guardians: [guardian.address],
      threshold: 1,
    });
    await operationResponse.wait();

    const guardians = await sdk.socialRecoveryModule.getGuardiansCount();
    expect(guardians).toBe(1n);
  });

  test('Social Recovery module isGuardian', async () => {
    const operationResponse = await sdk.installModule('SocialRecoveryModule', {
      guardians: [guardian.address],
      threshold: 1,
    });
    await operationResponse.wait();

    const isGuardian = await sdk.socialRecoveryModule.isGuardian(guardian.address);
    expect(isGuardian).toBe(true);
  });

  test('Social Recovery module nonce', async () => {
    const operationResponse = await sdk.installModule('SocialRecoveryModule', {
      guardians: [guardian.address],
      threshold: 1,
    });
    await operationResponse.wait();

    const guardians = await sdk.socialRecoveryModule.nonce();
    expect(guardians).toBe(0n);
  });

  test('Social Recovery module getThreshold', async () => {
    const operationResponse = await sdk.installModule('SocialRecoveryModule', {
      guardians: [guardian.address],
      threshold: 1,
    });
    await operationResponse.wait();

    const threshold = await sdk.socialRecoveryModule.getThreshold();
    expect(threshold).toBe(1n);
  });

  test('Social Recovery module approveRecovery and getRecoveryApprovals', async () => {
    const newOwner = ethers.Wallet.createRandom();
    const lostOwner = ethers.Wallet.createRandom();
    const lostWallet = await initTrueWallet({
      rpcProviderUrl: 'http://127.0.0.1:8545',
      bundlerUrl: 'http://127.0.0.1:3000',
      signer: {type: 'privateKey', data: [lostOwner.privateKey]},
    });
    const tx = await tankWallet.sendTransaction({to: lostWallet.address, value: ethers.parseEther('1')});
    await tx.wait();
    const deploy = await lostWallet.deployWallet();
    await deploy.wait();

    const operationResponse1 = await lostWallet.installModule('SocialRecoveryModule', {
      guardians: [sdk.address],
      threshold: 1,
    });
    await operationResponse1.wait();

    const approvals1 = await sdk.socialRecoveryModule.getRecoveryApprovals(lostWallet.address, [newOwner.address]);
    expect(approvals1).toBe(0n);

    const operationResponse2 = await sdk.socialRecoveryModule.approveRecovery(lostWallet.address, [newOwner.address], 172800);
    await operationResponse2.wait();

    const approvals2 = await sdk.socialRecoveryModule.getRecoveryApprovals(lostWallet.address, [newOwner.address]);
    expect(approvals2).toBe(1n);
  }, 20_000);

  test('Social Recovery module executeRecovery', async () => {
    const newOwner = ethers.Wallet.createRandom();
    const lostOwner = ethers.Wallet.createRandom();
    const lostWallet = await initTrueWallet({
      rpcProviderUrl: 'http://127.0.0.1:8545',
      bundlerUrl: 'http://127.0.0.1:3000',
      signer: {type: 'privateKey', data: [lostOwner.privateKey]},
    });
    const tx = await tankWallet.sendTransaction({to: lostWallet.address, value: ethers.parseEther('1')});
    await tx.wait();
    const deploy = await lostWallet.deployWallet();
    await deploy.wait();

    const operationResponse1 = await lostWallet.installModule('SocialRecoveryModule', {
      guardians: [sdk.address],
      threshold: 1,
    });
    await operationResponse1.wait();

    const operationResponse2 = await sdk.socialRecoveryModule.approveRecovery(lostWallet.address, [newOwner.address], 0);
    await operationResponse2.wait();

    const operationResponse3 = await sdk.socialRecoveryModule.executeRecovery(lostWallet.address);
    await operationResponse3.wait();

    const isOwner = await lostWallet.isWalletOwner(newOwner.address);
    expect(isOwner).toBe(true);
  }, 20_000);

  test('Social Recovery module cancelRecovery', async () => {
    const newOwner = ethers.Wallet.createRandom();
    const lostOwner = ethers.Wallet.createRandom();
    const lostWallet = await initTrueWallet({
      rpcProviderUrl: 'http://127.0.0.1:8545',
      bundlerUrl: 'http://127.0.0.1:3000',
      signer: {type: 'privateKey', data: [lostOwner.privateKey]},
    });
    const tx = await tankWallet.sendTransaction({to: lostWallet.address, value: ethers.parseEther('1')});
    await tx.wait();
    const deploy = await lostWallet.deployWallet();
    await deploy.wait();

    const operationResponse1 = await lostWallet.installModule('SocialRecoveryModule', {
      guardians: [sdk.address],
      threshold: 1,
    });
    await operationResponse1.wait();

    const operationResponse2 = await sdk.socialRecoveryModule.approveRecovery(lostWallet.address, [newOwner.address], 0);
    await operationResponse2.wait();

    const guardians1 = await sdk.socialRecoveryModule.nonce();
    expect(guardians1).toBe(1n);

    const operationResponse3 = await lostWallet.socialRecoveryModule.cancelRecovery();
    await operationResponse3.wait();

    const guardians2 = await sdk.socialRecoveryModule.nonce();
    expect(guardians2).toBe(0n);
  });

  test('Social Recovery module getRecoveryEntry', async () => {
    const newOwner = ethers.Wallet.createRandom();
    const lostOwner = ethers.Wallet.createRandom();
    const lostWallet = await initTrueWallet({
      rpcProviderUrl: 'http://127.0.0.1:8545',
      bundlerUrl: 'http://127.0.0.1:3000',
      signer: {type: 'privateKey', data: [lostOwner.privateKey]},
    });
    const tx = await tankWallet.sendTransaction({to: lostWallet.address, value: ethers.parseEther('1')});
    await tx.wait();
    const deploy = await lostWallet.deployWallet();
    await deploy.wait();

    const recoveryEntry1 = await sdk.socialRecoveryModule.getRecoveryEntry(lostWallet.address);
    expect(recoveryEntry1).toEqual([[], 0n, 0n]);

    const operationResponse1 = await lostWallet.installModule('SocialRecoveryModule', {
      guardians: [sdk.address],
      threshold: 1,
    });
    await operationResponse1.wait();

    const operationResponse2 = await sdk.socialRecoveryModule.approveRecovery(lostWallet.address, [newOwner.address], 172800);
    await operationResponse2.wait();

    const recoveryEntry2 = await sdk.socialRecoveryModule.getRecoveryEntry(lostWallet.address);
    expect(recoveryEntry2[0]).toEqual([newOwner.address]);
    const latest_block = await provider.getBlock();
    expect(recoveryEntry2[1]).toBeLessThanOrEqual(BigInt(latest_block['timestamp']) + 172800n);
    expect(recoveryEntry2[2]).toEqual(0n);
  }, 20_000);
});
