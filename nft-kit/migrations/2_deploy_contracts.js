// https://github.com/ProjectOpenSea/opensea-creatures/blob/master/migrations/2_deploy_contracts.js

const LogicReptile = artifacts.require("LogicReptile");

module.exports = async(deployer, network, addresses) => {
    // OpenSea proxy registry addresses for rinkeby and mainnet.
  let proxyRegistryAddress = "";
  if (network === 'rinkeby-fork' || network === 'rinkeby') {
    proxyRegistryAddress = "0xf57b2c51ded3a29e6891aba85459d600256cf317";
    
  } else {
   // proxyRegistryAddress = "0xa5409ec958c83c3f309868babaca7c86dcb077c1";
  }
    
    // Additional contracts can be deployed here
    await deployer.deploy(LogicReptile,"LogicReptileTest","LRT1",proxyRegistryAddress);
};