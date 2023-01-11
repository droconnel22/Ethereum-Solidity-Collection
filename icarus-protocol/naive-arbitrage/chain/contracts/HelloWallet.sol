// SPDX-License-Identifier: MIT
pragma solidity <0.9.0 >=0.7.0;



import "./uniswap/IUniswapV2Factory.sol";
import "./uniswap/IUniswapV2Router02.sol";
import "./token/IERC20.sol";
import "./aave/ILendingPoolAddressesProvider.sol";
import "./aave/ILendingPool.sol";
import "./aave/IFlashLoanReceiver.sol";
import "./yearn/IStrategy.sol";



// Kovan network
contract HelloWallet {

    address immutable private owner;
    IERC20 immutable private dai;
    IStrategy immutable private ydai;

    constructor() {
        owner = msg.sender;
        dai = IERC20(0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD);
        ydai = IStrategy(0x16de59092dAE5CcF4A1E6439D611fd0653f0Bd01);
    }

    modifier onlyAdmin(){
        require(msg.sender == owner, "!owner");
        _;
    }

    function save(uint amount) external {
        dai.transferFrom(msg.sender, address(this), amount);
        _save(amount);
    }

    function _save(uint256 amount) private {
        dai.approve(address(ydai), amount);
        ydai.deposit();
    }

    function spend(uint amount, address recipent) external onlyAdmin {
       _spend(amount, recipent);
    }

    function _spend(uint amount, address recipent) private onlyAdmin {
        uint balanceShares = ydai.balanceOf();
        ydai.withdraw(balanceShares);
        dai.transfer(recipent, amount);
        uint balanceDai = dai.balanceOf(address(this));
        if(balanceDai > 0) {
           _save(amount);
        }
    }
}