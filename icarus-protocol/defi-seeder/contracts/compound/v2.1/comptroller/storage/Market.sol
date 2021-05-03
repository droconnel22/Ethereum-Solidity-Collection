// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


struct Market {
        bool isListed;
        uint collateralFactorMantissa;
        mapping(address => bool) accountMembership;
        bool isComped;
}