const {initTrueWallet, encodeFunctionData} = require("../deps/js-sdk/dist/sdk.cjs");
const ethers = require("ethers");
require('dotenv').config();

describe('ERC1155 methods', () => {
  let owner;
  let sdk;
  let tankWallet;
  const ERC1155 = process.env.ERC1155;
  let nftId;
  let balanceOfABI = ['function balanceOf(address _owner, uint256 _id) external view returns (uint256)', 'function isApprovedForAll(address _owner, address _operator) external view returns (bool)'];
  let tokenContact;

  beforeAll(async () => {
    const provider = new ethers.JsonRpcProvider();
    tankWallet = await provider.getSigner();
    tokenContact = new ethers.Contract(ERC1155, balanceOfABI, tankWallet);
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

    // FIXME
    nftId = Math.floor(Math.random() * 99999999999);

    const abi = ['function mint(address to, uint256 id, uint256 amount, bytes memory data)'];
    const payload = encodeFunctionData(abi, 'mint', [sdk.address, nftId, 1, '0x']);
    const operationResponse = await sdk.execute(payload, ERC1155);
    await operationResponse.wait();
  }, 15_000);

  test('ERC1155 safeTransferFrom', async () => {
    const recipient = "0x0000000000000000000000000000000000000001";
    const operationResponse = await sdk.erc1155.safeTransferFrom({contractAddress: ERC1155, from: sdk.address, to: recipient, id: nftId, value: 1});
    await operationResponse.wait();

    const recipientBalance = await tokenContact.balanceOf(recipient, nftId);
    expect(recipientBalance).toBe(1n);
  });

  test('ERC1155 safeBatchTransferFrom', async () => {
    const recipient = "0x0000000000000000000000000000000000000002";
    const operationResponse = await sdk.erc1155.safeBatchTransferFrom({contractAddress: ERC1155, from: sdk.address, to: recipient, ids: [nftId], values: [1]});
    await operationResponse.wait();

    const recipientBalance = await tokenContact.balanceOf(recipient, nftId);
    expect(recipientBalance).toBe(1n);
  });

  test('ERC1155 balanceOf', async () => {
    const balanceOf = await sdk.erc1155.balanceOf(ERC1155, sdk.address, nftId);
    expect(balanceOf).toBe(1n);
  });

  test('ERC1155 balanceOfBatch', async () => {
    const balanceOfBatch = await sdk.erc1155.balanceOfBatch(ERC1155, [sdk.address], [nftId]);
    expect(balanceOfBatch).toBe([1n]);
  });

  test('ERC1155 setApprovalForAll', async () => {
    const operator = "0x0000000000000000000000000000000000000003";
    const operationResponse = await sdk.erc1155.setApprovalForAll({contractAddress: ERC1155, operator: operator, approved: true});
    await operationResponse.wait();

    const isApprovedForAll = await tokenContact.isApprovedForAll(sdk.address, operator);
    expect(isApprovedForAll).toBeTruthy();
  });

  test('ERC1155 isApprovedForAll', async () => {
    const isApprovedForAll = await sdk.erc1155.isApprovedForAll(ERC1155, sdk.address, tankWallet.address);
    expect(isApprovedForAll).toBeFalsy();
  });

  test('ERC1155 uri', async () => {
    const tokenUri = await sdk.erc1155.uri(ERC1155, nftId);
    expect(tokenUri).toBe("");
  });
});
