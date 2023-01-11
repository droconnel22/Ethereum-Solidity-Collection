import { utils, Wallet } from "zksync-web3";
import * as ethers from "ethers";
import {HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

// an example of  adeploy script that will deploy and call a simple contract

export default async function(hre: HardhatRuntimeEnvironment) {
    console.log(`Running deploy script for the Greeter contrac`);

    // initalize the wallet
    const wallet = new Wallet("0x9955d91bbaaf12c94fd88d0b5097d917f33c72aff991c3548ee8973f08d12097");

    // Create deployer object and load the artifact of the contract we want to deploy.
    const deployer = new Deployer(hre, wallet);
    const artifact = await deployer.loadArtifact("Greeter");

    // Deposit some funds to L2 in order to be able to perform l2 txns
    const depoistAmount = ethers.utils.parseEther("0.001");
    const depositHandle = await deployer.zkWallet.deposit({
        to: deployer.zkWallet.address,
        token: utils.ETH_ADDRESS,
        amount: depoistAmount
    });

    // wait until the deposit is processed on zkSync
    await depositHandle.wait();

    // Deploy this contract. The returned object will be of a `Contract` type, similary
    // `greeting` is an argument for the contract constructor.
    const greeting = "Hello There!";
    const greeterContract = await deployer.deploy(artifact,[greeting]);

    // Show the contract info
    const contractAddress = greeterContract.address;
    console.log(`${artifact.contractName} was deployed to ${contractAddress}`);
}