// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;


contract TestMultiCall {
    function func1() external view returns (uint, uint) {
        return (1, block.timestamp);
    }

    function func2() external view returns (uint, uint) {
        return (2, block.timestamp);
    }

    function getData1() external pure returns (bytes memory) {
        // abi encode
        return abi.encodeWithSelector(this.func1.selector);
    }

    function getData2() external pure returns (bytes memory) {
        return abi.encodeWithSelector(this.func2.selector);
    }
}

contract MultiCall {
    function makeMultiCall(address[] calldata targets, bytes[] calldata data)
     external 
     view 
     returns (bytes[] memory) 
    {
        require(targets.length == data.length, "targets length != data length");
        bytes[] memory results =new bytes[](data.length);

        for (uint i; i < targets.length; i++ ){
            // view funciton just want to query
            (bool successful, bytes memory resultData) = targets[i].staticcall(data[i]);
            require(successful, "static call failed");
            results[i] = resultData;
        }

        return results;
    }
}