// SPDX-License-Identifier: MIT

pragma solidity <0.9.0;

import "../utils/Strings.sol";
import "../access/Ownable.sol";
import "../ERC721/ERC721.sol";


contract TradeableERC721Token is ERC721, Ownable {
    using Strings for string;

  address proxyRegistryAddress;

  constructor(string memory _name,
   string memory _symbol, 
   address _proxyRegistryAddress
   ) ERC721(_name, _symbol)  {
    proxyRegistryAddress = _proxyRegistryAddress;
  }

  function baseTokenURI() public pure returns (string memory) {
    return "https://ipfs.io/ipfs/QmV3HwDUkFASJgpmSM4h6wbkRnRUU4UbFwgrdPpPB7tj9k?filename=2021-02-28_19-22-39-1350.mp4";
  }
}