
// SPDX-License-Identifier: MIT
pragma solidity >=0.5.11 <0.9.0;


import "./ERC721Tradable.sol";

/**
 * @title Creature
 * Creature - a contract for my non-fungible creatures.
 */
contract LogicReptileToken is ERC721Tradable {
    constructor(string memory name_, string memory symbol_, address proxyRegistryAddress_)
        ERC721Tradable(name_,symbol_, proxyRegistryAddress_)
    {}


    function baseTokenURI() public pure override returns (string memory) {
        return "https://ipfs.io/ipfs/QmV3HwDUkFASJgpmSM4h6wbkRnRUU4UbFwgrdPpPB7tj9k?filename=2021-02-28_19-22-39-1350.mp4";
    }

    function contractURI() public pure  returns (string memory) {
        return "https://ipfs.io/ipfs/QmV3HwDUkFASJgpmSM4h6wbkRnRUU4UbFwgrdPpPB7tj9k?filename=2021-02-28_19-22-39-1350.mp4";
    }
}
