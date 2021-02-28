pragma solidity 0.8.0;
contract EthPriceOracleInterface {
  function getLatestEthPrice() public returns (uint256);
}