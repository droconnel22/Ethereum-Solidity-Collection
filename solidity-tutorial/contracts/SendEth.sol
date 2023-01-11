// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Fallback {

    event Log(string fun, address sender, uint value, bytes data);

    fallback() external payable {
        emit Log("fallback", msg.sender, msg.value, msg.data);
    }

    receive() external payable {
        emit Log("receive", msg.sender, msg.value, "");
    }

}

// 3 ways to send ETH
// transfer - 2300 gas, reverts
// send - 2300 gas, return sbool
// call - all gas, returns bool and data

contract SendEther {
    constructor () payable {}

    receive() external payable {}

    function sendViaTransfer (address payable _to) external payable {
        _to.transfer(123);
    }

    function sendViaSend(address payable _to ) external payable {
        bool sent = _to.send(123); //2300 gas
        require(sent, "send failed");
    }

    function sendViaCall(address payable _to) external payable {
        _to.call{value: 123}("");
    }
}

contract EthReceiver {
    event Log(uint amount, uint gas);

    receive() external payable {
        emit Log(msg.value, gasleft());
    }
}

contract EtherWallet {
    address payable public owner;

    constructor() {
        owner = payable(msg.sender);
    }

    receive() external payable {}

    function withdraw(uint _amount) external {
        require(msg.sender == owner, "only owner");
        payable(msg.sender).call{value: _amount}("");
        //owner.transfer(_amount);
    }

    function getBalance() external view returns (uint eth) {
        return address(this).balance;
    }
}