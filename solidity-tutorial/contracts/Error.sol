// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;


// require, revert, assert
// gas refund, state updates are reverted
// custom error - save gas
// assert() uses the 0xfe opcode to cause an error condition
// require() uses the 0xfd opcode to cause an error condition

// https://docs.soliditylang.org/en/develop/control-structures.html#error-handling-assert-require-revert-and-exceptions
// 1. Gas efficiency
// assert(false) compiles to 0xfe, which is an invalid opcode, using up all 
//remaining gas, and reverting all changes.

// require(false) compiles to 0xfd which is the REVERT opcode, meaning it will 
//refund the remaining gas. The opcode can also return a value (useful for debugging), 
// but I don't believe that is supported in Solidity as of this moment. (2017-11-21)

// 2. Bytecode analysis
// From the docs (emphasis mine)

// The require function should be used to ensure valid conditions, such as inputs, 
// or contract state variables are met, or to validate return values from calls to external contracts. 
// If used properly, analysis tools can evaluate your contract to identify the conditions and function 
// calls which will reach a failing assert. Properly functioning code should never reach a failing assert 
// statement; if this happens there is a bug in your contract which you should fix.

// The above excerpt is a reference to the still (as of 2017-11-21) experimental and undocumented 
// SMTChecker.

// I use a few heuristics to help me decide which to use.

// Use require() to:
// Validate user inputs
// Validate the response from an external contract
// ie. use require(external.send(amount))
// Validate state conditions prior to executing state changing operations, for example in an owned 
//contract situation
// Generally, you should use require more often,
// Generally, it will be used towards the beginning of a function.
// Use assert() to:
// check for overflow/underflow
// check invariants
// validate contract state after making changes
// avoid conditions which should never, ever be possible.
// Generally, you should use assert less often
// Generally, it will be use towards the end of your function.
// Basically, assert is just there to prevent anything really bad from happening, but it shouldn't be 
//possible for the condition to evaluate to false.

// Exceptions can contain error data that is passed back to the caller in the form of error instances.
// The built-in errors Error(string) and Panic(uint256) are used by special functions, as explained below.
// Error is used for “regular” error conditions while Panic is used for errors that should not be present 
//in bug-free code.

contract Error {

    uint public num = 123;

    function testRequire(uint _i) public pure {
        require(_i <= 10, "i greater then 10");
    }

    function testRevert(uint _i) public pure {
        if(_i <= 10) {
            revert("i greater then 10");
        }
    }

    function testAssert() public view {
        assert(num == 123);
    }

    error MyError(address caller, uint i);

    function testCustomError(uint _i) public view {
        if(_i > 10 ){
            revert MyError(msg.sender, _i);
        }
    }
}