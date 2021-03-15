// SPDX-License-Identifier: MIT
pragma solidity <0.9.0 >=0.5.0;


import "./chainlink/AggregatorV3Interface.sol";

contract HelloOracle {

    AggregatorV3Interface internal priceFeed;
    
    address private aggregatorAddress;
    
    event PriceReceived(int indexed price, uint80 roundId, uint startedAt,uint timeStamp, uint80 answeredInRound);

    /**
     * Network: Kovan
     * Aggregator: ETH/USD
     * Address: 0x9326BFA02ADD2366b30bacB125260Af641031331
     */
    constructor(address aggregatorAddress_) {
        aggregatorAddress = aggregatorAddress_;
        priceFeed = AggregatorV3Interface(aggregatorAddress);
    }

    /**
     * Returns the latest price
     */
    function getLatestPrice() external returns (int) {
        (
            uint80 roundID, 
            int price,
            uint startedAt,
            uint timeStamp,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();
        emit PriceReceived(price, roundID, startedAt,timeStamp, answeredInRound);
        return price;
    }
}