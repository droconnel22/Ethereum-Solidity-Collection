// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ComptrollerV4Storage.sol";



contract ComptrollerV5Storage is ComptrollerV4Storage {
    /// @notice The portion of COMP that each contributor receives per block
    mapping(address => uint) public compContributorSpeeds;

    /// @notice Last block at which a contributor's COMP rewards have been allocated
    mapping(address => uint) public lastContributorBlock;
}
