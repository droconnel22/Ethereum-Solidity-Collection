
// SPDX-License-Identifier: MIT
pragma solidity >=0.5.11 <0.9.0;

import "../ERC721/ERC721Full.sol";

/**
 * @title Creature
 * Creature - a contract for my non-fungible creatures.
 */
contract LogicReptileToken is ERC721Full {    

    constructor(string memory name_, string memory symbol_, string memory baseURI_)
        ERC721Full(name_,symbol_,baseURI_)
    {}   

    function baseURI() external view returns (string memory){
        return _baseURI();
    } 
}