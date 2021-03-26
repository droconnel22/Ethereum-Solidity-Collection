
const HelloOracle = artifacts.require("HelloOracle");
const HelloDex = artifacts.require("HelloDex");

const UniswapV2Factory = artifacts.require("@uniswap/v2-core/contracts/UniswapV2Factory.sol");


// address constant private uniswapV2FactoryAddress = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;

// address constant private uniswapV2Router02Address = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;

// address constant private uniswapV2PairAddress = 0x92FacdfB69427CffC1395a7e424AeA91622035Fc;

// address constant private oracleDAIETHPriceFeedAddress = 0x22B58f1EbEDfCA50feF632bD73368b2FdA96D541;

// address constant private daiAddress = 0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD;

module.exports = async (deployer, network, addresses) => {
  //let aggregatorAddress = "0x9326BFA02ADD2366b30bacB125260Af641031331";
  //await deployer.deploy(HelloOracle,aggregatorAddress);
  await deployer.deploy(HelloDex);
  let uniswapV2FactoryAddress = "";
  let uniswapV2Router02Address = "";
  let uniswapV2PairAddress = "";
  let oracleDAIETHPriceFeedAddress = "";
  let daiAddress = "";
  let owner = ""; 

  
  if(network === "development") {
    owner = addresses[0];
    await deployer.deploy()
  }

  if(network === "kovan") {

  }
};