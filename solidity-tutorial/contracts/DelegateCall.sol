// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

/*
    A calls B, sending 100 wei
    B calls C, sends 50 wei

    A --> B --> C

    msg.sender = B
    msg.value = 50
    execute code on C's state variables
    use ETH in C

    Exceptions to this rule are send and the low-level functions call, delegatecall and staticcall: 
    they return false as their first return value in case of an exception instead of “bubbling up”.

    A calls B sends 100 wei
    B delegatecall C
    A --> B ---> C
    msg.sender = A
    msg.value = 100
    execute code on B's state variables
    use ETH in B

*/

contract TestDelegateCall {
    uint public num;
    address public sender;
    uint public value;

    function setVars(uint _num) external payable {
        num = _num;
        sender = msg.sender;
        value = msg.value;
    }
}

// note the state variables must be in the same order
contract DelegateCall {
    uint public num;
    address public sender;
    uint public value;

    function setVars(address _test, uint _num) external payable {
        //_test.delegatecall(abi.encodeWithSignature("setVars(uint256)", _num));
        (bool success, bytes memory data) = _test.delegatecall(
            abi.encodeWithSelector(TestDelegateCall.setVars.selector, _num)
        );
        require(success, "delegatecallfailed");
    }

}