// https://github.com/ProjectOpenSea/opensea-creatures/blob/master/migrations/2_deploy_contracts.js

const LogicReptileToken = artifacts.require("LogicReptileToken");

module.exports = async (deployer, network, addresses) => {
  // OpenSea proxy registry addresses for rinkeby and mainnet.
  let proxyRegistryAddress = "";
  let baseURI = "https://ipfs.io/ipfs/"
  let name = "LogicReptile"
  let symbol = "LRV3"

  if (network === 'rinkeby-fork' || network === 'rinkeby') {
    proxyRegistryAddress = "0xf57b2c51ded3a29e6891aba85459d600256cf317";
    
  } else if(network === "development") {
    proxyRegistryAddress =addresses[4];
  }else {
   // proxyRegistryAddress = "0xa5409ec958c83c3f309868babaca7c86dcb077c1";
  }
    
  // Additional contracts can be deployed here
  await deployer.deploy(LogicReptileToken, name, symbol,baseURI);
};