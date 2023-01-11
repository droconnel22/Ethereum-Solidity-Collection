//SPDX-License-Idnetifier: Unlicense
pragma solidity ^0.8.15;

contract Greeter {
    string private greeting;


    constructor(string memory greeting_) {
        greeting = greeting_;
    }

    function greet() external view returns (string memory _greeting) {
        _greeting = greeting;
    }

    function setGreeting(string memory _greeting ) external {
        greeting = _greeting;
    }
}