const {initTrueWallet, encodeFunctionData, toWei} = require("../deps/js-sdk/dist/sdk.cjs");
const ethers = require("ethers");
require('dotenv').config();

describe('ERC20 methods', () => {
  let owner;
  let sdk;
  let tankWallet;
  const ERC20 = process.env.ERC20;

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

    const tx = await tankWallet.sendTransaction({to: sdk.address, value: ethers.parseEther('1')});
    await tx.wait();

    const abi = ['function mint(address account, uint256 amount)'];
    const payload = encodeFunctionData(abi, 'mint', [sdk.address, ethers.parseEther('1')]);
    const operationResponse = await sdk.execute(payload, ERC20);
    await operationResponse.wait();
  }, 15_000);

  test('ERC20 getBalance', async () => {
    const balance = await sdk.erc20.getBalance(ERC20);
    expect(balance).toBe("1.0");
  });

  test('ERC20 send', async () => {
    const operationResponse = await sdk.erc20.send({to: tankWallet.address, amount: 1, contractAddress: ERC20});
    await operationResponse.wait();

    const balance = await sdk.erc20.getBalance(ERC20);
    expect(balance).toBe("0.0");
  });

  test('ERC20 name', async () => {
    const name = await sdk.erc20.name(ERC20);
    expect(name).toBe("");
  });

  test('ERC20 symbol', async () => {
    const symbol = await sdk.erc20.symbol(ERC20);
    expect(symbol).toBe("");
  });

  test('ERC20 decimals', async () => {
    const decimals = await sdk.erc20.decimals(ERC20);
    expect(decimals).toBe(18n);
  });

  test('ERC20 totalSupply', async () => {
    const totalSupply = await sdk.erc20.totalSupply(ERC20);
    expect(totalSupply).toBeGreaterThan(0n);
  });

  test('ERC20 balanceOf', async () => {
    const balanceOf = await sdk.erc20.balanceOf(ERC20, sdk.address);
    expect(balanceOf).toBe(ethers.parseEther('1'));
  });

  test('ERC20 allowance', async () => {
    const allowance = await sdk.erc20.allowance(ERC20, sdk.address, tankWallet.address);
    expect(allowance).toBe(0n);
  });

  test('ERC20 transfer', async () => {
    const balance1 = await sdk.erc20.getBalance(ERC20);
    const decimals = await sdk.erc20.decimals(ERC20);
    const operationResponse = await sdk.erc20.transfer({to: tankWallet.address, amount: toWei('0.2', decimals), contractAddress: ERC20});
    await operationResponse.wait();

    const balance2 = await sdk.erc20.getBalance(ERC20);
    expect(balance2).toBe((balance1 - 0.2).toString());
  });

  test('ERC20 transferFrom', async () => {
    const decimals = await sdk.erc20.decimals(ERC20);

    const operationResponse1 = await sdk.erc20.transfer({to: tankWallet.address, amount: toWei('0.2', decimals), contractAddress: ERC20});
    await operationResponse1.wait();
    const abi = ['function approve(address _spender, uint256 _value) public returns (bool success)', 'function balanceOf(address _owner) public view returns (uint256 balance)'];
    const tokenContact = new ethers.Contract(ERC20, abi, tankWallet);
    const operationResponse2 = await tokenContact.approve(sdk.address, toWei('0.2', decimals));
    await operationResponse2.wait();

    const balance1 = await tokenContact.balanceOf(tankWallet.address);

    const operationResponse3 = await sdk.erc20.transferFrom({from: tankWallet.address, to: "0x0000000000000000000000000000000000000001", amount: toWei('0.2', decimals), contractAddress: ERC20});
    await operationResponse3.wait();

    const balance2 = await tokenContact.balanceOf(tankWallet.address);
    expect(balance2).toBe(balance1 - toWei('0.2', decimals));
  }, 15_000);

  test('ERC20 approve', async () => {
    const decimals = await sdk.erc20.decimals(ERC20);
    const operationResponse = await sdk.erc20.approve({spender: tankWallet.address, amount: toWei('0.2', decimals), contractAddress: ERC20});
    await operationResponse.wait();
  });
});
