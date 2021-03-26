// SPDX-License-Identifier: MIT

pragma solidity >=0.5.0 <0.9.0;


import "./uniswap/IUniswapV2Factory.sol";
import "./uniswap/IUniswapV2Router02.sol";
import "./token/IERC20.sol";
import "./aave/ILendingPoolAddressesProvider.sol";
import "./aave/ILendingPool.sol";
import "./aave/IFlashLoanReceiver.sol";
import "./yearn/IStrategy.sol";



// Kovan network

contract HelloTemplate {

    address constant private uniswapV2FactoryAddress = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;

    address constant private uniswawpV2Router02Address = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;

    address constant private daiAddress = 0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD;

    address constant private usdcAddress = 0xe22da380ee6B445bb8273C81944ADEB6E8450422;

    address constant private snxAddress = 0x7FDb81B0b8a010dd4FFc57C3fecbf145BA8Bd947;

    address constant private zrxAddress = 0xD0d76886cF8D952ca26177EB7CfDf83bad08C00C;

    address constant private susdAddress = 0x99b267b9D96616f906D53c26dECf3C5672401282;

    address constant private linkAddress = 0xAD5ce863aE3E4E9394Ab43d4ba0D80f419F61789;

    address constant private lendingPoolAddressProvider = 0x88757f2f99175387aB4C6a4b3067c77A695b0349;

    address constant private lendingPool = 0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe;

    address immutable private owner;

    IUniswapV2Factory immutable internal uniSwapV2Factory;

    IUniswapV2Router02 immutable internal uniSwapV2Router02;

    ILendingPoolAddressesProvider immutable internal provider;

    ILendingPool immutable internal pool;

    constructor() {
        uniSwapV2Factory = IUniswapV2Factory(uniswapV2FactoryAddress);
        uniSwapV2Router02 = IUniswapV2Router02(uniswawpV2Router02Address);
        provider = ILendingPoolAddressesProvider(lendingPoolAddressProvider);
        pool = ILendingPool(lendingPool);
        owner = msg.sender;
    }

    
}