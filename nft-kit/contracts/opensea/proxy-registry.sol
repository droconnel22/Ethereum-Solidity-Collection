// SPDX-License-Identifier: MIT

pragma solidity <0.9.0;

import "../utils/Context.sol";


contract OwnableDelegateProxy { }

contract ProxyRegistry {
    mapping(address => OwnableDelegateProxy) public proxies;
}