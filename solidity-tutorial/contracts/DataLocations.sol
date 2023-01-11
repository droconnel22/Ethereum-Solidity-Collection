// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Data Locations - storage, memory, and calldata

contract DataLocations {
    struct MyStruct {
        uint foo;
        string text;
    }

    mapping (address => MyStruct) public myStructs;

    function examples() external {
        myStructs[msg.sender] = MyStruct({foo: 123, text: "bar"});
    }

    function update() external {
        MyStruct storage fooStruct = myStructs[msg.sender];
        fooStruct.text = "foo2";
    }

    function fetch() external view returns (MyStruct memory struct_) {
        MyStruct memory fooStruct = myStructs[msg.sender];
        struct_ = fooStruct;        
    }

    function example2(uint[] memory y, string memory s) external view returns (MyStruct memory) {
        return myStructs[msg.sender];
    }
}