const {initTrueWallet, encodeFunctionData} = require("../deps/js-sdk/dist/sdk.cjs");
const ethers = require("ethers");
require('dotenv').config();

describe('ERC721 methods', () => {
  let owner;
  let sdk;
  let tankWallet;
  const ERC721 = process.env.ERC721;
  let nftId;

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

    // FIXME
    nftId = Math.floor(Math.random() * 99999999999);

    const abi = ['function safeMint(address to, uint256 tokenId)'];
    const payload = encodeFunctionData(abi, 'safeMint', [sdk.address, nftId]);
    const operationResponse = await sdk.execute(payload, ERC721);
    await operationResponse.wait();
  }, 15_000);

  test('ERC721 balanceOf', async () => {
    const nftBalance = await sdk.erc721.balanceOf(ERC721);
    expect(nftBalance).toBe("1");
  });

  test('ERC721 getApproved', async () => {
    const approved = await sdk.erc721.getApproved(ERC721, nftId);
    expect(approved).toBe("0x0000000000000000000000000000000000000000");
  });

  test('ERC721 isApprovedForAll', async () => {
    const isApprovedForAll = await sdk.erc721.isApprovedForAll(ERC721, sdk.address, tankWallet.address);
    expect(isApprovedForAll).toBeFalsy();
  });

  test('ERC721 name', async () => {
    const name = await sdk.erc721.name(ERC721);
    expect(name).toBe("TKN");
  });

  test('ERC721 symbol', async () => {
    const symbol = await sdk.erc721.symbol(ERC721);
    expect(symbol).toBe("TKN");
  });

  test('ERC721 tokenURI', async () => {
    const tokenURI = await sdk.erc721.tokenURI(ERC721, nftId);
    expect(tokenURI).toBe("");
  });

  test('ERC721 ownerOf', async () => {
    const ownerOf = await sdk.erc721.ownerOf(ERC721, nftId);
    expect(ownerOf).toBe(sdk.address);
  });

  test('ERC721 approve', async () => {
    const approve = await sdk.erc721.approve({
      to: tankWallet.address,
      tokenId: nftId,
      contractAddress: ERC721,
    });
    await approve.wait();
  }, 15_000);

  test('ERC721 setApprovalForAll', async () => {
    const setApprovalForAll = await sdk.erc721.setApprovalForAll({
      operator: tankWallet.address,
      approved: false,
      contractAddress: ERC721,
    });
    await setApprovalForAll.wait();
  }, 15_000);

  test('ERC721 transferFrom', async () => {
    const transferFrom = await sdk.erc721.transferFrom({
      from: sdk.address,
      to: tankWallet.address,
      tokenId: nftId,
      contractAddress: ERC721,
    });
    await transferFrom.wait();
  }, 15_000);

  test('ERC721 safeTransferFrom', async () => {
    const safeTransferFrom = await sdk.erc721.safeTransferFrom({
      from: sdk.address,
      to: tankWallet.address,
      tokenId: nftId,
      contractAddress: ERC721,
    });
    await safeTransferFrom.wait();
  }, 15_000);
});
