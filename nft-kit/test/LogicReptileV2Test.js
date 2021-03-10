
const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

const LogicReptileToken = artifacts.require("LogicReptileToken");
const { expect } = require('chai');

//const toBN = web3.utils.toBN;

contract("LogicReptileToken - ERC721 ", (accounts) => {
    const NAME = "LogicReptileToken";
    const SYMBOL = "LRV2"
    const BASE_URL = "https://ipfs.io/ipfs/"
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
    const owner = accounts[0];
    const deployer = accounts[1];
    const other = accounts[2];

    const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';

    const MINTER_ROLE = web3.utils.soliditySha3('MINTER_ROLE');


    beforeEach(async () => {
        token = await LogicReptileToken.new(NAME,SYMBOL,BASE_URL);
    })

    describe('name', () => {
        it("should return LogicReptileToken", async () => {
            const instance = await LogicReptileToken.deployed();
            const name = await instance.name();
            console.log(name);
        });

        it("should return LogicReptileToken", async () => {
            const instance = await LogicReptileToken.deployed();
            const symbol = await instance.symbol();
            console.log(symbol);
        });        
    });

    describe('balanceOf', async () => {
        const instance = await LogicReptileToken.deployed();
        const balanceOf = await instance.balanceOf(owner);
        console.log(balanceOf);
    });

    describe('minting', function () {
        it('deployer can mint tokens', async function () {
            const tokenId = new BN("QmV3HwDUkFASJgpmSM4h6wbkRnRUU4UbFwgrdPpPB7tj9k");
    
            const receipt = await token.mint(owner, hash { from: owner });
            expectEvent(receipt, 'Transfer', { from: ZERO_ADDRESS, to: other, tokenId });
        
            expect(await token.balanceOf(other)).to.be.bignumber.equal('1');
            expect(await token.ownerOf(tokenId)).to.equal(other);
        
            expect(await token.tokenURI(tokenId)).to.equal(BASE_URL + tokenId);
        });
    });

});