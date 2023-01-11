// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

// Dutch Auction = a seller initially sets a price which then goes down over time.

contract DutchAuction {
    uint private constant DURATION = 7 days;

    IERC721 public immutable nft;
    uint public immutable nftId;
    address payable public immutable seller;
    uint public immutable startingPrice;
    uint public immutable startAt;
    uint public immutable expiresAt;
    uint public immutable discountRate;


    constructor(
        address _nft,
         uint _nftId, 
         uint _startingPrice, 
         uint _discountRate) 
    {
        seller = payable(msg.sender);
        startingPrice = _startingPrice;
        discountRate = _discountRate;
        startAt = block.timestamp;
        expiresAt = startAt + DURATION;
        nft = IERC721(_nft);
        nftId = _nftId;

        require(_startingPrice >= _discountRate * DURATION, "discount greater then price");
    }

    function getPrice() public view returns (uint) {
        uint timeElapsed = block.timestamp - startAt;
        uint discount = discountRate * timeElapsed;
        return startingPrice - discount;
    }

    function buy() external payable {
        require(block.timestamp < expiresAt, "auction is over");
        
        uint price = getPrice();
        require(price >= msg.value, "not enough ETH sent");

        nft.transferFrom(seller, msg.sender, nftId);
        uint refund = msg.value - price;
        if (refund > 0 ) {
            payable(msg.sender).transfer(refund);
        }
        // send all eth to seller
        // closes auction
        selfdestruct(seller);
    }

}