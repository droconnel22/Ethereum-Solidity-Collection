// SPDX-License-Identifier: MIT
pragma solidity <0.9.0;

import "./IERC20.sol";

interface IJAR is IERC20 {
    function token() external view returns (address);

    function claimInsurance() external;

    function getRatio() external view returns (uint256);

    function depositAll() external;

    function deposit(uint256) external;

    function withdrawAll() external;

    function Withdraw(uint256) external;

    function earn() external;

    function decimals() external view returns (uint8);
}