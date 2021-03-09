
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
}