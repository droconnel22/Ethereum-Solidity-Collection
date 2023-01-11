const { expect } = require("chai");

describe("Coinflip", function () {

    let Coinflip;
    let coinflip;
    let Coinhack;
    let coinhack;


    before(async function () {
        const [owner, otherAccount] = await ethers.getSigners();

        Coinflip = await ethers.getContractFactory("Coinflip");
        coinflip = await Coinflip.deploy();

        Coinhack = await ethers.getContractFactory("Coinhack");
        coinhack = await Coinhack.deploy(coinflip.address);
    })

    it("hack contract by hijacking logic", async function() {
        const [owner, otherAccount] = await ethers.getSigners();

        for(i = 0; i < 10; i++){
            await coinhack.connect(owner).flip();
        }

        // check for consequective wins;
        const consecutiveWins = await coinflip.connect(owner).consecutiveWins();
        console.log(consecutiveWins)
        expect(consecutiveWins == 10)


    })

})