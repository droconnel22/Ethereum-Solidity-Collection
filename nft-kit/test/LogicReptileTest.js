
const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

const LogicReptileToken = artifacts.require("LogicReptileToken");
const { expect } = require('chai');

//const toBN = web3.utils.toBN;

contract("LogicReptileToken - ERC721 ", (accounts) => {
    const NAME = "LogicReptileToken";
    const SYMBOL = "LRV2"
    const BASE_URL = "https://ipfs.io/ipfs/";
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
    const owner = accounts[0];
    const deployer = accounts[1];
    const other = accounts[2];
    const anotherApproved = accounts[3];

    const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const MINTER_ROLE = web3.utils.keccak256('MINTER_ROLE');
    const PAUSER_ROLE = web3.utils.keccak256('PAUSER_ROLE');
    const BURNER_ROLE = web3.utils.keccak256('BURNER_ROLE');
    let token;



    beforeEach(async () => {
        token = await LogicReptileToken.new(NAME,SYMBOL,BASE_URL);
    });

    it("token has correct name LogicReptileToken", async () => {
        expect(await token.name()).to.be.eql("LogicReptileToken");
    });

    it("token has correct symbol should return LRV2", async () => {
        expect(await token.symbol()).to.equal("LRV2");
    });  
    
    it('owner has the default admin role', async function () {
        expect(await token.getRoleMemberCount(DEFAULT_ADMIN_ROLE)).to.be.bignumber.equal('1');
        expect(await token.getRoleMember(DEFAULT_ADMIN_ROLE, 0)).to.equal(owner);
    });
    
    it('owner has the minter role', async function () {
        expect(await token.getRoleMemberCount(MINTER_ROLE)).to.be.bignumber.equal('1');
        expect(await token.getRoleMember(MINTER_ROLE, 0)).to.equal(owner);
    });

    // it('deployer has the burner role', async function () {
    //     expect(await token.getRoleMemberCount(BURNER_ROLE)).to.be.bignumber.equal('0');
    //     expect(await token.getRoleMember(BURNER_ROLE, 0)).to.equal(owner);
    // });


    it('owner has the pauser role', async function () {
        expect(await token.getRoleMemberCount(PAUSER_ROLE)).to.be.bignumber.equal('1');
        expect(await token.getRoleMember(PAUSER_ROLE, 0)).to.equal(owner);
    });

    it('other has the pauser role', async function () {
        await token.grantRole(PAUSER_ROLE, other);
        expect(await token.getRoleMemberCount(PAUSER_ROLE)).to.be.bignumber.equal('2');
        expect(await token.getRoleMember(PAUSER_ROLE, 1)).to.equal(other);
    });

    it('token has correct base URI', async function () {        
        expect(await token.baseURI()).to.equal(BASE_URL);
    });

    it('admin updates base URI ', async function () {   
        let newBaseURI = 'https://mycontent.foo.io/';
        await token.setTokenBaseURI(newBaseURI);     
        expect(await token.baseURI()).to.equal(newBaseURI);
        await token.setTokenBaseURI(BASE_URL);
    });

    it('balanceOf', async () => {
        expect(await token.balanceOf(owner)).to.be.bignumber.equal('0');
    });
    
    describe('mint(address,string,bytes16)', () => {
        it("minter can mint tokens with URI data", async function() {
            //console.log(web3.utils);
            await LogicReptileToken.deployed();
            const artist = accounts[5];
            let tokenId = web3.utils.toBN("0");
            const tokenURI = "QmV3HwDUkFASJgpmSM4h6wbkRnRUU4UbFwgrdPpPB7tj9k";
            const edition = "0x10000000000000000000000000000000";
            const receipt = await token.mint(artist, tokenURI, edition);
            expectEvent(receipt, 'Minted', {_artist: artist, _tokenId: tokenId, _tokenURI: tokenURI, _edition: edition});
            expect(await token.balanceOf(artist)).to.be.bignumber.equal('1');
            expect(await token.ownerOf(tokenId)).to.equal(artist);
            expect(await token.tokenURI(tokenId)).to.equal(BASE_URL + tokenURI);
            console.log(`${artist} -> ${tokenId} -> ${await token.tokenURI(tokenId)}`);
        });

        it('other accounts cannot mint tokens', async function () {
            const artist = accounts[5];
            const tokenURI1 = "QmV3HwDUkFASJgpmSM4h6wbkRnRUU4UbFwgrdPpPB7tj9k";
            const edition = "0x10000000000000000000000000000000";
            await LogicReptileToken.deployed();
            await expectRevert(
                token.mint(artist, tokenURI1, edition, { from: other }),
              'ERC721 Full: Minter Role Required.',
            );
        });

        it('reverts when queried for non existent token id', async function () {
            let nonExistentTokenId = web3.utils.toBN("7");
            await expectRevert(
              token.tokenURI(nonExistentTokenId),
               'ERC721FULL: Token Id Does Not Exist',
            );
          });

        context("with previously minted token", async function () {
            const artist = accounts[5];
            let tokenId1 = web3.utils.toBN("0");
            let tokenId2 = web3.utils.toBN("1");
            const tokenURI1 = "QmV3HwDUkFASJgpmSM4h6wbkRnRUU4UbFwgrdPpPB7tj9k";
            const tokenURI2 = "QmV3HwDUkFASJgpmSM4h6wbkZZZZZ4UbFwgrdPpPB7tj9k";
            const edition = "0x10000000000000000000000000000000";

            beforeEach(async function() {
                await LogicReptileToken.deployed();
                const receipt1 = await token.mint(artist, tokenURI1, edition);
                expectEvent(receipt1, 'Minted', {_artist: artist, _tokenId: tokenId1, _tokenURI: tokenURI1, _edition: edition});

            });

            it("Minter mints twice", async function() {
                const receipt2 = await token.mint(artist, tokenURI2, edition);        
                expectEvent(receipt2, 'Minted', {_artist: artist, _tokenId: tokenId2, _tokenURI: tokenURI2, _edition: edition});
                expect(await token.balanceOf(artist)).to.be.bignumber.equal('2');
                expect(await token.ownerOf(tokenId2)).to.equal(artist);
                expect(await token.tokenURI(tokenId2)).to.equal(BASE_URL + tokenURI2);
                expect(await token.totalSupply()).to.be.bignumber.equal('2');
            }); 
    
        });

        context('when the given token ID was not tracked by this token', function () {
            const nonexistentTokenId = 5;        
            it('reverts', async function () {
              await expectRevert(
                token.ownerOf(nonexistentTokenId), 
                'ERC721: owner query for nonexistent token',
              );
            });
          });

          context('when the given token ID exists but not owned by caller', function () {
            const tokenId = 1;        
            it('reverts', async function () {
              await expectRevert(
                token.ownerOf(tokenId , {from: other}), 
                'ERC721: owner query for nonexistent token',
              );
            });
          });

        context('when querying the zero address', function () {
            it('throws', async function () {
              await expectRevert(
                token.balanceOf(ZERO_ADDRESS), 'ERC721: balance query for the zero address',
              );
            });
        });

        context('when the given address does not own any tokens', function () {
            it('returns 0', async function () {
              expect(await token.balanceOf(other)).to.be.bignumber.equal('0');
            });
          });
    });

    describe('burn(uint256)', () => {
        context("with existing token", async function () {
            const artist = accounts[5];
            let tokenId1 = web3.utils.toBN("0");
            let tokenId2 = web3.utils.toBN("1");
            const tokenURI1 = "QmV3HwDUkFASJgpmSM4h6wbkRnRUU4UbFwgrdPpPB7tj9k";
            const tokenURI2 = "QmV3HwDUkFASJgpmSM4h6wbkZZZZZ4UbFwgrdPpPB7tj9k";
            const edition = "0x10000000000000000000000000000000";

            beforeEach(async function() {
                await LogicReptileToken.deployed();
                const receipt1 = await token.mint(artist, tokenURI1, edition);
                expectEvent(receipt1, 'Minted', {_artist: artist, _tokenId: tokenId1, _tokenURI: tokenURI1, _edition: edition});

            });

            it("owner burns", async function() {
                const burnNotice = await token.burn(tokenId1, {from: artist});
                expectEvent(burnNotice, 'Burned', {_tokenId: tokenId1});
                expect(await token.balanceOf(artist)).to.be.bignumber.equal('0');
                expect(await token.totalSupply()).to.be.bignumber.equal('0');
            });

            it("non owner attempts to burn" , async function() {
                await expectRevert(
                    token.burn(tokenId1, {from: other}), 
                    "ERC721: Not Permissioned To Burn.",
                  );
            });

            it("owner can alternatively burn" , async function() {
                const burnNotice = await token.burn(tokenId1);
                expectEvent(burnNotice, 'Burned', {_tokenId: tokenId1});
            });

            context("burned token", async function () {

                beforeEach(async function() {
                    await LogicReptileToken.deployed();
                    await token.burn(tokenId1, {from: artist});
                });
                it("ownerOf throws", async function() {
                    await expectRevert(
                        token.ownerOf(tokenId1), 
                        'ERC721: owner query for nonexistent token',
                      );
                });

                it("tokenURI throws", async function() {
                    await expectRevert(
                        token.tokenURI(tokenId1), 
                        "ERC721FULL: Token Id Does Not Exist",
                      );
                });
            });
        });
    });

    describe('approve', function () {
        context("With existing token", async function (){
            const currentArtist = accounts[5];
            const nextArtist = accounts[6];
            const invalidOwner = accounts[4];
            let tokenId1 = web3.utils.toBN("0");
            let nonExistentTokenId1 = web3.utils.toBN("378");
            const tokenURI1 = "QmV3HwDUkFASJgpmSM4h6wbkZZZZZ4UbFwgrdPpPB7tj9k";
            const edition = "0x10000000000000000000000000000000";

            beforeEach(async function() {
                await LogicReptileToken.deployed();
                const receipt1 = await token.mint(currentArtist, tokenURI1, edition);
                expectEvent(receipt1, 'Minted', {_artist: currentArtist, _tokenId: tokenId1, _tokenURI: tokenURI1, _edition: edition});
            });
            

            describe('valid owner approves token for non zero address', () => {
                let logs = null;

                beforeEach(async function () {
                   ({ logs } = await token.approve(nextArtist, tokenId1, { from: currentArtist }));
                });

                it('sets the approval for the target address', async function () {
                    expect(await token.getApproved(tokenId1)).to.be.equal(nextArtist);
                });

                it('emits an approval event', async function () {
                    expectEvent.inLogs(logs, 'Approval', {
                      owner: currentArtist,
                      approved: nextArtist,
                      tokenId: tokenId1,
                    });
                });
            });

            describe('invalid owner approves token for non zero address', () => {
                it('reverts', async function () {
                    await expectRevert(token.approve(nextArtist, tokenId1, { from: invalidOwner }),
                      'ERC721: approve caller is not owner nor approved');
                  });
            });

            describe('contract owner approves themselves', () => {
                it('reverts', async function () {
                    await expectRevert(token.approve(owner, tokenId1, { from: owner }),
                      'ERC721: approve caller is not owner nor approved');
                  });
            });
        });

        context("Without existing token", async function() {
            const currentArtist = accounts[5];
            const nextArtist = accounts[6];
            let tokenId1 = web3.utils.toBN("0");
            let nonExistentTokenId1 = web3.utils.toBN("378");
            const tokenURI1 = "QmV3HwDUkFASJgpmSM4h6wbkZZZZZ4UbFwgrdPpPB7tj9k";
            const edition = "0x10000000000000000000000000000000";

            describe('valid owner approves non existing token for non zero address', () =>{
                it('reverts', async function () {
                    await expectRevert(token.approve(nextArtist, nonExistentTokenId1, { from: owner }),
                      'ERC721: owner query for nonexistent token');
                  });
            });
        });

        context("Clearing approval", async function() {
            const currentArtist = accounts[5];
            const nextArtist = accounts[6];
            const invalidOwner = accounts[4];
            let tokenId1 = web3.utils.toBN("0");
            let nonExistentTokenId1 = web3.utils.toBN("378");
            const tokenURI1 = "QmV3HwDUkFASJgpmSM4h6wbkZZZZZ4UbFwgrdPpPB7tj9k";
            const edition = "0x10000000000000000000000000000000";
            let logs =  null;

            beforeEach(async function() {
                await LogicReptileToken.deployed();
                const receipt1 = await token.mint(currentArtist, tokenURI1, edition);
                ({logs} = await token.approve(nextArtist, tokenId1, { from: currentArtist}));
            });

            const itClearsApproval = function () {
                it('clears approval for the token', async function () {
                  expect(await token.getApproved(tokenId1)).to.be.equal(ZERO_ADDRESS);
                });
              };

            const itEmitsApprovalEvent = function(foo1Address, foo2Address) {
                it('emits an approval event', async function () {
                    expectEvent.inLogs(logs, 'Approval', {
                      owner: foo1Address,
                      approved: foo2Address,
                      tokenId: tokenId1,
                    });
                });
            }

        

            context('when there was no prior approval', function () {
                    const currentArtist = accounts[5];
                    const nextArtist = accounts[6];
                    const invalidOwner = accounts[4];
                    let tokenId1 = web3.utils.toBN("0");
                    let nonExistentTokenId1 = web3.utils.toBN("378");
                    const tokenURI1 = "QmV3HwDUkFASJgpmSM4h6wbkZZZZZ4UbFwgrdPpPB7tj9k";
                    const edition = "0x10000000000000000000000000000000";
                    let logs =  null;


                    beforeEach(async function () {
                        ({ logs } = await token.approve(ZERO_ADDRESS, tokenId1, { from: currentArtist }));
                    });   

                    itClearsApproval();
                   
              });

              context('when there was prior approval', function () {
                    const currentArtist = accounts[5];
                    const nextArtist = accounts[6];
                    const invalidOwner = accounts[4];
                    let tokenId1 = web3.utils.toBN("0");
                    let nonExistentTokenId1 = web3.utils.toBN("378");
                    const tokenURI1 = "QmV3HwDUkFASJgpmSM4h6wbkZZZZZ4UbFwgrdPpPB7tj9k";
                    const edition = "0x10000000000000000000000000000000";
                    let logs =  null;

                    beforeEach(async function () {
                        await token.approve(nextArtist, tokenId1, { from: currentArtist});
                        ({ logs } = await token.approve(ZERO_ADDRESS, tokenId1, { from: currentArtist }));
                    });  

                    itClearsApproval();                
            });
        });
        
    });

    describe("transferFrom", function (){

        const currentArtist = accounts[5];
        const nextArtist = accounts[6];
        const invalidOwner = accounts[4];
        let tokenId1 = web3.utils.toBN("0");
        let nonExistentTokenId1 = web3.utils.toBN("378");
        const tokenURI1 = "QmV3HwDUkFASJgpmSM4h6wbkZZZZZ4UbFwgrdPpPB7tj9k";
        const edition = "0x10000000000000000000000000000000";
        let logs = null;

        beforeEach(async function() {
            await LogicReptileToken.deployed();
            const receipt1 = await token.mint(currentArtist, tokenURI1, edition);
            await token.approve(nextArtist, tokenId1, {from: currentArtist});
            await token.approve(owner, tokenId1, {from: currentArtist});
        });

        const transferWasSuccessful = function({owner, tokenId, approved}) {
                it('transfers the ownership of the given token ID to the given address', async function () {
                expect(await token.ownerOf(tokenId)).to.be.equal(nextArtist);
              });
      
              it('emits a Transfer event', async function () {
                expectEvent.inLogs(logs, 'Transfer', { from: owner, to: nextArtist, tokenId: tokenId });
              });
      
              it('clears the approval for the token ID', async function () {
                expect(await token.getApproved(tokenId)).to.be.equal(ZERO_ADDRESS);
              });
      
              it('emits an Approval event', async function () {
                expectEvent.inLogs(logs, 'Approval', { currentArtist, approved: ZERO_ADDRESS, tokenId: tokenId });
              });
      
              it('adjusts owners balances', async function () {
                expect(await token.balanceOf(currentArtist)).to.be.bignumber.equal('0');
              });
      
              it('adjusts owners tokens by index', async function () {
                if (!token.tokenOfOwnerByIndex) return;
      
                expect(await token.tokenOfOwnerByIndex(nextArtist, 0)).to.be.bignumber.equal(tokenId);
      
                expect(await token.tokenOfOwnerByIndex(currentArtist, 0)).to.be.bignumber.not.equal(tokenId);
              });
        }      

        describe('via safeTransferFrom', function () {
            let logs = null;
            beforeEach(async function () {
              ({logs} =  await token.safeTransferFrom(currentArtist, nextArtist, tokenId1, {from : currentArtist}));
            });

            it('transfers the ownership of the given token ID to the given address', async function () {
                expect(await token.ownerOf(tokenId1)).to.be.equal(nextArtist);
            });
      
            it('emits a Transfer event', async function () {
                expectEvent.inLogs(logs, 'Transfer', { from: currentArtist, to: nextArtist, tokenId: tokenId1 });
            });

            it('adjusts owners balances', async function () {
                expect(await token.balanceOf(nextArtist)).to.be.bignumber.equal('1');
            });

            it('adjusts owners tokens by index', async function () {
                if (!token.tokenOfOwnerByIndex) return;
      
                expect(await token.tokenOfOwnerByIndex(nextArtist, 0)).to.be.bignumber.equal(tokenId1);
      
                //expect(await token.tokenOfOwnerByIndex(currentArtist, 0)).to.be.bignumber.not.equal(tokenId1);
              });
            
          });
    })
});