// SPDX-License-Identifier: MIT

pragma solidity >=0.5.8 <0.9.0;

import "../ownership/Ownable.sol";
import "./IERC721Factory.sol";
import "./LogicReptile.sol";
import "../utils/Strings.sol";


contract LogicReptileFactory is IERC721Factory, Ownable {
    
    using Strings for string;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    
    address public proxyRegistryAddress;

    address public nftAddress;

    string public baseURI = "";

    
    uint256 REPTILE_SUPPLY = 1;

    uint256 NUM_OPTIONS = 1;

    constructor(address proxyRegistryAddress_, address nftAddress_) {
        proxyRegistryAddress = proxyRegistryAddress_;
        nftAddress = nftAddress_;
        emit Transfer(address(0), owner(), 0);
    }

    function name() external pure override returns (string memory){
        return "Repitle Token Factory";
    }    

    function symbol() external pure override returns (string memory){
        return "LTF001";
    }

    function supportsFactoryInterface() public pure override returns (bool) {
        return true;
    }

    function numOptions() public view override returns (uint256) {
        return NUM_OPTIONS;
    }

    function mint(uint256 _optionId, address _to) public override {
        ProxyRegistry proxyRegistry  = ProxyRegistry(proxyRegistryAddress);
        assert(
            address(proxyRegistry.proxies(owner())) == msg.sender ||
            owner() == msg.sender
        );
        require(canMint(_optionId));

        LogicReptileToken logicReptileToken = LogicReptileToken(nftAddress);
        logicReptileToken.mintTo(_to);
    }

    function canMint(uint256 _optionId) public view override returns (bool) {
        return true;
    }

    function tokenURI(uint256 _optionId) external view override returns (string memory){
        LogicReptileToken logicReptileToken = LogicReptileToken(nftAddress);
        return logicReptileToken.baseTokenURI();
    }     
}