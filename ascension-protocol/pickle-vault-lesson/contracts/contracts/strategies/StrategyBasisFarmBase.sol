// SPDX-License-Identifier: MIT
pragma solidity <0.9.0;

import "./StrategyStakingRewardsBase.sol";

import "../utils/safemath.sol";
import "../tokens/SafeErc20.sol";


abstract contract StrategyBasisFarmBase is StrategyStakingRewardsBase {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;


    // Token addresses
    address public bas = 0xa7ED29B253D8B4E3109ce07c80fc570f81B63696;
    address public dai = 0x6B175474E89094C44Da98b954EedeAC495271d0F;

    // DAI/<token1> pair
    address public token1;

    // BAS Amounts
    uint256 public keepBAS = 0;
    uint256 public constant keepBASMax = 10000;

    constructor(
        address token1_,
        address rewards_,
        address lp_,
        address goverance_,
        address strategist_,
        address controller_,
        address timelock_
    ) StrategyStakingRewardsBase(
        rewards_,
        lp_,
        goverance_,
        strategist_,
        controller_,
        timelock_
    ) {
        token1 = token1_;
    }

    function setKeepBAS(uint256 _keepBAS) external {
        require(msg.sender == timelock, "!timelock");
        keepBAS = _keepBAS;
    }

    // State Changes

    function harvest() public override onlyBenevolent {

        address[] memory path = new address[](2);

        // Collect BAS tokens
        ISTAKINGREWARDS(rewards).getReward();
        uint256 _bas = IERC20(bas).balanceOf(address(this));
        if( _bas > 0) {
            // 10 % lock up up
            uint256 _keepBAS = _bas.mul(keepBAS).div(keepBASMax);
            IERC20(bas).safeTransfer(ICONTROLLER(controller).treasury(), _keepBAS);
            path[0] = bas;
            path[1] = dai;
            _swapUniswapWithPath(path, _bas.sub(_keepBAS));
        }

        // Swap half Dai for token
        uint256 _dai = IERC20(dai).balanceOf(address(this));
        if(_dai > 0) {
            path[0] = dai;
            path[1] = token1;
            _swapUniswapWithPath(path, _dai.div(2));
        }

        // Add in liquidity for DAI/Token
        _dai = IERC20(dai).balanceOf(address(this));
        uint256 _token1 = IERC20(token1).balanceOf(address(this));
        if(_dai > 0 && _token1 > 0) {
            IERC20(dai).safeApprove(univ2Router2, 0);
            IERC20(dai).safeApprove(univ2Router2, _dai);

            IERC20(token1).safeApprove(univ2Router2, 0);
            IERC20(token1).safeApprove(univ2Router2, _token1);

            // create liquidity pool at dex
            UniswapRouterV2(univ2Router2).addLiquidity(
                dai,
                token1,
                _dai,
                _token1,
                0,
                0,
                address(this),
                block.timestamp + 60
            );

            // Donates DUST
            IERC20(dai).transfer(
                ICONTROLLER(controller).treasury(),
                IERC20(dai).balanceOf(address(this))
            );

            IERC20(token1).safeTransfer(
                ICONTROLLER(controller).treasury(),
                IERC20(token1).balanceOf(address(this))
            );
        }

        // We want to get back the liqiudity pool tokens
        _distributePerformanceFeesAndDeposit();        
    }

}