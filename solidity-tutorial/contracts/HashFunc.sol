// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;


contract HashFunc {
    function hash(string memory text, uint num, address addr) external pure returns (bytes32) {
        // encode into bytes
        // abi encode 
        // abi encode packed - also encodes the data into bytes and compresses it (avoids hash collision)

        bytes memory package = abi.encodePacked(text, num, addr);
        bytes32 result = keccak256(package);
        return result;
    }

    function encode(string memory text0, string memory text1) external pure returns (bytes memory){
        return abi.encode(text0,text1);
    }

    function encodePacked(string memory text0, string memory text1) external pure returns (bytes memory){
        return abi.encodePacked(text0,text1);
    }
}