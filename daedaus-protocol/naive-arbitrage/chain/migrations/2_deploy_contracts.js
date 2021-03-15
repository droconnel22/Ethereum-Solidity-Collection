
const HelloOracle = artifacts.require("HelloOracle");

module.exports = async (deployer, network, addresses) => {
  let aggregatorAddress = "0x9326BFA02ADD2366b30bacB125260Af641031331";
  await deployer.deploy(HelloOracle,aggregatorAddress);
};