Solidity v0.5.0 Breaking Changes

* The functions .call(), .delegatecall(), staticcall(), keccak256(), sha256() and ripemd160() now accept only a single bytes argument.
* Moreover, the argument is not padded. This was changed to make more explicit and clear how the arguments are concatenated
* Change every .call() (and family) to a .call("") and every .call(signature, a, b, c) to use .call(abi.encodeWithSignature(signature, a, b, c)) (the last one only works for value types). Change every keccak256(a, b, c) to keccak256(abi.encodePacked(a, b, c)). Even though it is not a breaking change, it is suggested that developers change
* Functions .call(), .delegatecall() and .staticcall() now return (bool, bytes memory) to provide access to the return data. Change bool success = otherContract.call("f") to (bool success, bytes memory data) = otherContract.call("f").
* The address type was split into address and address payable, where only address payable provides the transfer function. 
* An address payable can be directly converted to an address, but the other way around is not allowed. 
* Converting address to address payable is possible via conversion through uint160
* If c is a contract, address(c) results in address payable only if c has a payable fallback function. If you use the withdraw pattern, you most likely do not have to change your code because transfer is only used on msg.sender instead of stored addresses and msg.sender is an address payable.
* Using msg.value in non-payable functions (or introducing it via a modifier) is disallowed as a security feature. Turn the function into payable or create a new internal function for the program logic that uses msg.value.
* Constructors must now be defined using the constructor keyword.
* Calling base constructors without parentheses is now disallowed.
* Specifying base constructor arguments multiple times in the same inheritance hierarchy is now disallowed.
* Calling a constructor with arguments but with wrong argument count is now disallowed.
* suicide is now disallowed (in favor of selfdestruct).
* throw is now disallowed (in favor of revert, require and assert)

Solidity v0.6.0 Breaking Changes


* Functions can now only be overridden when they are either marked with the virtual keyword or defined in an interface.
* Functions without implementation outside an interface have to be marked virtual
* When overriding a function or modifier, the new keyword override must be used
* When overriding a function or modifier defined in multiple parallel bases, all bases must be listed in parentheses after the keyword like so: override(Base1, Base2).
* Member-access to length of arrays is now always read-only, even for storage arrays
* Use push(), push(value) or pop() instead, or assign a full array, which will of course overwrite the existing content, prevent storage collisions of gigantic storage arrays.

* The new keyword abstract can be used to mark contracts as abstract, if contract doesn't implement all functions
* Abstract contracts cannot be created using the new operator, and it is not possible to generate bytecode for them during compilation.

* Libraries have to implement all their functions, not only the internal ones.

* The names of variables declared in inline assembly may no longer end in _slot or _offset.
* Variable declarations in inline assembly may no longer shadow any declaration outside the inline assembly block
* State variable shadowing is now disallowed. A derived contract can only declare a state variable x, if there is no visible state variable with the same name in any of its bases.

* Conversions from external function types to address are now disallowed. Instead external function types have a member called address, similar to the existing selector member.
* The function push(value) for dynamic storage arrays does not return the new length anymore (it returns nothing).


** unnamed fallback function changes **

* The unnamed function commonly referred to as “fallback function” was split up into a new fallback function that is defined using the fallback keyword and a receive ether function defined using the receive keyword.

* If present, the receive ether function is called whenever the call data is empty (whether or not ether is received). This function is implicitly payable.

* The new fallback function is called when no other function matches (if the receive ether function does not exist then this includes calls with empty call data). 
* You can make this function payable or not. 
* If it is not payable then transactions not matching any other function which send value will revert. 
* You should only need to implement the new fallback function if you are following an upgrade or proxy pattern.

## New Features

* The try/catch statement allows you to react on failed external calls
* struct and enum types can be declared at file level.
* Array slices can be used for calldata arrays, for example abi.decode(msg.data[4:], (uint, uint)) is a low-level way to decode the function call payload.
* Yul and Inline Assembly have a new statement called leave that exits the current function.
* Conversions from address to address payable are now possible via payable(x), where x must be of type address.

Solidity v0.7.0 Breaking Changes

* Exponentiation and shifts of literals by non-literals (e.g. 1 << x or 2 ** x) will always use either the type uint256 (for non-negative literals) or int256 (for negative literals) to perform the operation

* In external function and contract creation calls, Ether and gas is now specified using a new syntax:
    x.f{gas: 10000, value: 2 ether}(arg1, arg2). 
    
    The old syntax – 

    x.f.gas(10000).value(2 ether)(arg1, arg2) 

    – will cause an error.

* The global variable now is deprecated, block.timestamp should be used instead. 
* The single identifier now is too generic for a global variable and could give the impression that it changes during transaction processing, whereas block.timestamp correctly reflects the fact that it is just a property of the block.
* The token gwei is a keyword now (used to specify, e.g. 2 gwei as a number) and cannot be used as an identifier.
* String literals now can only contain printable ASCII characters and this also includes a variety of escape sequences, such as hexadecimal (\xff) and unicode escapes (\u20ac).
* Unicode string literals are supported now to accommodate valid UTF-8 sequences. They are identified with the unicode prefix: unicode"Hello 😃".

* State Mutability: 
    The state mutability of functions can now be restricted during inheritance: 
     * Functions with default state mutability can be overridden by pure and view functions 
     * while view functions can be overridden by pure functions. 
     *  At the same time, public state variables are considered view and even pure if they are constants.

* If a struct or array contains a mapping, it can only be used in storage.
* Assignments to structs or arrays in storage does not work if they contain mappings. 
* Visibility (public / internal) is not needed for constructors anymore

* Type Checker: Disallow virtual for library functions: Since libraries cannot be inherited from, library functions should not be virtual.

* Multiple events with the same name and parameter types in the same inheritance hierarchy are disallowed.

* using A for B only affects the contract it is mentioned in. Previously, the effect was inherited. Now, you have to repeat the using statement in all derived contracts that make use of the feature.

* The finney and szabo denominations are removed. They are rarely used and do not make the actual amount readily visible. Instead, explicit values like 1e20 or the very common gwei can be used.

* The keyword var cannot be used anymore. Previously, this keyword would parse but result in a type error and a suggestion about which type to use. Now, it results in a parser error.

Solidity v0.8.0 Breaking Changes

* Arithmetic operations revert on underflow and overflow. You can use unchecked { ... } to use the previous wrapping behaviour.

* Checks for overflow are very common, so we made them the default to increase readability of code, even if it comes at a slight increase of gas costs.

* ABI coder v2 is activated by default.

* Exponentiation is right associative, i.e., the expression a**b**c is parsed as a**(b**c). Before 0.8.0, it was parsed as (a**b)**c.

* Failing assertions and other internal checks like division by zero or arithmetic overflow do not use the invalid opcode but instead the revert opcode. 

* More specifically, they will use error data equal to a function call to Panic(uint256) with an error code specific to the circumstances.

* This will save gas on errors while it still allows static analysis tools to distinguish these situations from a revert on invalid input, like a failing require.

* If a byte array in storage is accessed whose length is encoded incorrectly, a panic is caused.

* A contract cannot get into this situation unless inline assembly is used to modify the raw representation of storage byte arrays.

* If constants are used in array length expressions, previous versions of Solidity would use arbitrary precision in all branches of the evaluation tree.

* Now, if constant variables are used as intermediate expressions, their values will be properly rounded in the same way as when they are used in run-time expressions.

* The type byte has been removed. It was an alias of bytes1.

There are new restrictions related to explicit conversions of literals. The previous behaviour in the following cases was likely ambiguous:

* Explicit conversions from negative literals and literals larger than type(uint160).max to address are disallowed.

* Explicit conversions between literals and an integer type T are only allowed if the literal lies between type(T).min and type(T).max. In particular, replace usages of uint(-1) with type(uint).max.

* Explicit conversions between literals and enums are only allowed if the literal can represent a value in the enum.

* Explicit conversions between literals and address type (e.g. address(literal)) have the type address instead of address payable. 

* One can get a payable address type by using an explicit conversion, i.e., payable(literal).

* Explicit conversions between literals and address type (e.g. address(literal)) have the type address instead of address payable. 

* Address literals have the type address instead of address payable. They can be converted to address payable by using an explicit conversion

* There are new restrictions on explicit type conversions. The conversion is only allowed when there is at most one change in sign, width or type-category (int, address, bytesNN, etc.). To perform multiple changes, use multiple conversions.

* address(uint) and uint(address): converting both type-category and width. Replace this by address(uint160(uint)) and uint(uint160(address)) respectively.

* payable(uint160), payable(bytes20) and payable(integer-literal): converting both type-category and state-mutability. Replace this by payable(address(uint160)), payable(address(bytes20)) and payable(address(integer-literal)) respectively. Note that payable(0) is valid and is an exception to the rule.

* int80(bytes10) and bytes10(int80): converting both type-category and sign. Replace this by int80(uint80(bytes10)) and bytes10(uint80(int80) respectively.

* Contract(uint): converting both type-category and width. Replace this by Contract(address(uint160(uint))).

* These conversions were disallowed to avoid ambiguity. For example, in the expression uint16 x = uint16(int8(-1)), the value of x would depend on whether the sign or the width conversion was applied first.

* Function call options can only be given once, i.e. c.f{gas: 10000}{value: 1}() is invalid and has to be changed to c.f{gas: 10000, value: 1}().

* The global functions log0, log1, log2, log3 and log4 have been removed.

* These are low-level functions that were largely unused. Their behaviour can be accessed from inline assembly.

* enum definitions cannot contain more than 256 members.

* Declarations with the name this, super and _ are disallowed, with the exception of public functions and events. 

* The exception is to make it possible to declare interfaces of contracts implemented in languages other than Solidity that do permit such function names.

* The global variables tx.origin and msg.sender have the type address instead of address payable. 

* One can convert them into address payable by using an explicit conversion, i.e., payable(tx.origin) or payable(msg.sender).

* This change was done since the compiler cannot determine whether or not these addresses are payable or not, so it now requires an explicit conversion to make this requirement visible.

* Explicit conversion into address type always returns a non-payable address type.
* In particular, the following explicit conversions have the type address instead of address payable:
* address(u) where u is a variable of type uint160
* One can convert u into the type address payable by using two explicit conversions, i.e., payable(address(u)).
* address(b) where b is a variable of type bytes20.
* One can convert b into the type address payable by using two explicit conversions, i.e., payable(address(b)).
* address(c) where c is a contract. Previously, the return type of this conversion depended on whether the contract can receive Ether (either by having a receive function or a payable fallback function).
* The conversion payable(c) has the type address payable and is only allowed when the contract c can receive Ether.
* In general, one can always convert c into the type address payable by using the following explicit conversion: payable(address(c))
* Note that address(this) falls under the same category as address(c) and the same rules apply for it.
* If you rely on wrapping arithmetic, surround each operation with unchecked { ... }.
* Optional: If you use SafeMath or a similar library, change x.add(y) to x + y, x.mul(y) to x * y etc.
* Add pragma abicoder v1; if you want to stay with the old ABI coder.
* Optionally remove pragma experimental ABIEncoderV2 or pragma abicoder v2 since it is redundant.
* Change byte to bytes1.
* Combine c.f{gas: 10000}{value: 1}() to c.f{gas: 10000, value: 1}()
* Change msg.sender.transfer(x) to payable(msg.sender).transfer(x) or use a stored variable of address payable type.
* Change x**y**z to (x**y)**z.
* Negate unsigned integers by subtracting them from the maximum value of the type and adding 1 (e.g. type(uint256).max - x + 1, while ensuring that x is not zero)
