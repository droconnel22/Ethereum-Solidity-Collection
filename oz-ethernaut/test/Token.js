const { expect } = require("chai");

describe("Token", function () {

    let Token;
    let token;
    let HackToken;
    let hackToken;


    const initialSupplyCauseUnderflow = 0

    before(async function () {
        const [owner, otherAccount] = await ethers.getSigners();

        Token = await ethers.getContractFactory("Token");
        token = await Token.deploy(initialSupplyCauseUnderflow);

        console.log(token.address);

        HackToken = await ethers.getContractFactory("HackToken");
        hackToken = await HackToken.deploy(token.address);
    })

    it("hack token by causing underflow", async function() {
        const [owner, otherAccount] = await ethers.getSigners();

        console.log("Initial balance", await token.connect(owner).balanceOf(owner.address));
        await hackToken.connect(owner).underflow();        
        console.log("Post Hack Balance", await token.connect(owner).balanceOf(owner.address));

       
        // check for consequective wins;
        const consecutiveWins = await coinflip.connect(owner).consecutiveWins();
        console.log(consecutiveWins)
        expect(consecutiveWins == 10)


    })

})