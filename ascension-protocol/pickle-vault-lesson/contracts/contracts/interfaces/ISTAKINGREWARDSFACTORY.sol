// SPDX-License-Identifier: MIT
pragma solidity <0.9.0 >=0.8.0;

interface ISTAKINGREWARDSFACTORY {
    function deploy(address stakingToken, uint256 rewardAmount) external;

    function isOwner() external view returns (bool);

    function notifyRewardAmount(address stakingToken) external;

    function notifyRewardAmounts() external;

    function owner() external view returns (address);

    function renounceOwnership() external;

    function rewardsToken() external view returns (address);

    function stakingRewardsGenesis() external view returns (uint256);

    function stakingRewardsInfoByStakingToken(address) external view returns(address stakingRewards, uint256 rewardAmount);

    function stakingTokens(uint256) external view returns (address);

    function transferOwnership(address newOwner)external;
}