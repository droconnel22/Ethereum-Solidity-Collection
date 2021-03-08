// SPDX-License-Identifier: MIT

pragma solidity >=0.5.11 <0.9.0;

import "../gsn/Context.sol";


contract OwnableDelegateProxy { }

contract ProxyRegistry {
    mapping(address => OwnableDelegateProxy) public proxies;
}