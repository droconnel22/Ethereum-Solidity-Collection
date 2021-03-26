// SPDX-License-Identifier: MIT
pragma solidity <0.9.0 >=0.5.0;

interface IStrategy {
    function want() external view returns (address);
    function deposit() external;
    function withdraw(address) external;
    function withdraw(uint) external;
    function skim() external;
    function withdrawAll() external returns (uint);
    function balanceOf() external view returns (uint);
}