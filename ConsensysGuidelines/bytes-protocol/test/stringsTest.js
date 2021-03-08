const errTypes = require("./exceptions.helper.js").errTypes;
const Strings = artifacts.require('Strings');


contract("Strings", async (accounts) => {
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
    

    it('Should concat two values', async () => {
        const stringInstance = await Strings.deployed();      

        let a  = "Hello ";
        let b = "World";

        const response = await stringInstance.concat(a,b);
        console.log(`Response: ${response}`);
    });

    it('Should return valid value of string', async () => {
        const stringInstance = await Strings.deployed();      

        let a  = "Hello World";
        let b = "o";

        const response = await stringInstance.strpos(a,b);
        console.log(`Response: ${response}`);
    });

    it('Should return -1 for invalid value of string', async () => {
        const stringInstance = await Strings.deployed();      

        let a  = "Hello";
        let b = "g";
        const response = await stringInstance.strpos(a,b);
        console.log(`Response: ${response}`);
    });

});
