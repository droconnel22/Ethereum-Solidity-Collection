// SPDX-License-Identifier: MIT
pragma solidity <0.9.0;

import "./StrategyBase.sol";

import "../utils/safemath.sol";
import "../tokens/SafeErc20.sol";


abstract contract StrategyStakingRewardsBase is StrategyBase {
    
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    address public rewards;

    constructor(
        address rewards_,
        address want_,
        address goverance_,
        address strategist_,
        address controller_,
        address timelock_
    ) 
    StrategyBase(want_,goverance_,strategist_,controller_, timelock_) {
        rewards = rewards_;
    }

    function balanceOfPool() public override view returns (uint256) {
        return ISTAKINGREWARDS(rewards).balanceOf(address(this));
    }

    function getHarvestable() external view returns (uint256) {
        return ISTAKINGREWARDS(rewards).earned(address(this));
    }

    // Setters
    function deposit() public override {
        uint256 _want = IERC20(want).balanceOf(address(this));
        if(_want > 0) {
            IERC20(want).safeApprove(rewards, 0);
            IERC20(want).safeApprove(rewards, _want);
            ISTAKINGREWARDS(rewards).stake(_want);
        }
    }

    function _withdrawSome(uint256 _amount) internal override returns (uint256) {
        ISTAKINGREWARDS(rewards).withdraw((_amount));
        return _amount;
    }
}

