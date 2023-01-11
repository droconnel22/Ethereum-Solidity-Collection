// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract CallTestContract {
    function setX(address _testContract, uint _x) external {
        TestContract(_testContract).setX(_x);
    }

    function setX_V2(TestContract _testContract, uint _x) external {
        _testContract.setX(_x);
    }

    function getX(address _testContract) external view returns (uint) {
        uint x = TestContract(_testContract).getX();
        return x;
    }

    function getX_V2(TestContract _test) external view returns (uint) {
        return _test.getX();
    }

    function setXandReceiveEther(address _test, uint _x) external payable {
        TestContract(_test).setXandReceiveEther{value: msg.value}(_x);
    }

    function getXandValue(address _test) external view returns (uint, uint) {
        (uint x, uint v) = TestContract(_test).getXandValue();
        return (x, v);
    }
}

contract TestContract {
    uint public x;
    uint public value = 123;

    function setX(uint _x) external {
        x = _x;
    }

    function getX() external view returns (uint) {
        return x;
    }

    function setXandReceiveEther(uint _x) external payable {
        x = _x;
        value = msg.value;
    }

    function getXandValue() external view returns (uint, uint){
        return (x, value);
    }
}