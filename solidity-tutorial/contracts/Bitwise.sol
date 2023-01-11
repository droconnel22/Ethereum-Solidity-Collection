// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract BitwiseOps {
    // x    = 1110 = 8 + 4 + 2 + 0 = 14
    // y    = 1011 = 8 + 0 + 2 + 1 = 11
    // x & y = 1010 = 8 + 0 + 2 + 0 = 10
    function and(uint x, uint y) external pure returns (uint) {
        return x & y;
    }

    // x    = 1100 = 8 + 4 + 0 + 0 = 12
    // y    = 1001  = 8 + 0 + 0 +1 = 9
    // if either bit is 1, return 1
    // x | y = 1101 = 8 + 4 + 0 + 1 = 13
    function or(uint x, uint  y) external pure returns (uint) {
        return x | y;
    }

    // only return 1 if one of the bit is a 1
    // x    = 1100  = 8 + 4 + 0 + 0 = 12
    // y    = 0101  = 0 + 4 + 0 + 1 = 5
    // x ^ y = 1001 = 8 + 0 + 0 + 1 = 9
    function xor(uint x, uint y) external pure returns (uint) {
        return x ^ y;
    }

    // simple operator, flips the bits, if 1 goes to 0, vica versa
    // x    = 00001100 =  0 + 0 + 0 + 0 + 8  + 4 + 0  + 0 = 12
    // ~x   = 11110011 =  128 + 64 + 32 + 16 + 0 + 0 + 2 + 1 = 243  
    function not (uint8 x) external pure returns (uint8) {
        return ~x;
    }

    // shift bit either left
    // has effect of doubling...
    // 1 << 0 = 0001 --> 0001 = 1
    // 1 << 1 = 0001 --> 0010 = 2
    // 1 << 2 = 0001 --> 0100 = 4
    // 1 << 3 = 0001 --> 1000 = 8
    function shiftLeft(uint x, uint bits) external pure returns (uint) {
        return x << bits;
    }

    function shiftRight(uint x, uint bits) external pure returns (uint) {
        return x >> bits;
    }
}