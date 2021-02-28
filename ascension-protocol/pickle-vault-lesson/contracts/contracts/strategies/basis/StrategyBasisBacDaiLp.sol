// SPDX-License-Identifier: MIT
pragma solidity <0.9.0;

import "../StrategyBasisFarmBase.sol";

contract StrategyBasisBacDaiLp is StrategyBasisFarmBase {

    // Token Address
    address public basRewards = 0x067d4D3CE63450E74F880F86b5b52ea3edF9Db0f;
    address public UniswapBacDaiLp = 0xd4405F0704621DBe9d4dEA60E128E0C3b26bddbD;
    address public bac = 0x3449FC1Cd036255BA1EB19d65fF4BA2b8903A69a;

    constructor(
        address goverance_,
        address strategist_,
        address controller_,
        address timelock_
    )
    StrategyBasisFarmBase(
        bac,
        basRewards,
        UniswapBacDaiLp,
        goverance_,
        strategist_,
        controller_,
        timelock_
    ) {

    }

    // View
    function getName() external override pure returns(string memory) {
        return "Strategy Basis BAC / DAI Liqudity Pool";
    }  

}