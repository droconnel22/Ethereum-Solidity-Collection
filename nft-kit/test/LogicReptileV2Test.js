
const LogicReptileToken = artifacts.require("LogicReptileToken");

const toBN = web3.utils.toBN;

contract("LogicReptileToken - ERC721 ", (accounts) => {
    const NAME = "LogicReptileToken";
    const SYMBOL = "LRV2"
    const PROXY_ADDRESS = accounts[4];
    let token;

    beforeEach(async () => {
        token = await LogicReptileToken.new(NAME,SYMBOL,PROXY_ADDRESS);
    })

});