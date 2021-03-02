// SPDX-License-Identifier: MIT

pragma solidity <0.9.0;

import "./TradeableERC721Token.sol";

contract TonyArtToken is ERC721Tradable {
    using Strings for string;
  constructor(string memory _name,
   string memory _symbol, 
   address _proxyRegistryAddress
   ) ERC721Tradable(_name, _symbol,_proxyRegistryAddress)  {
    
  }

  function baseTokenURI() public pure returns (string memory) {
    return "https://ipfs.io/ipfs/QmV3HwDUkFASJgpmSM4h6wbkRnRUU4UbFwgrdPpPB7tj9k?filename=2021-02-28_19-22-39-1350.mp4";
  }
}