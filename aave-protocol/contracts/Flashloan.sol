// SPDX-License-Identifier: MIT
pragma solidity <0.9.0 >=0.7.0;

import "./aave/FlashLoanReceiverBase.sol";
import "./aave/ILendingPoolAddressesProvider.sol";
import "./aave/ILendingPool.sol";

contract Flashloan is FlashLoanReceiverBase {

    constructor(address _addressProvider) FlashLoanReceiverBase(_addressProvider) public {}

    /**
        This function is called after your contract has received the flash loaned amount
     */
    function executeOperation(
        address _anyERC20ContractAddressAsReserve,
        uint256 _thatERC20AmountToBorrow,
        uint256 _theFeeForProcessTheFlashloan,
        bytes calldata _anyImmutableExtraData
    )
        external
        override
    {
        require(_thatERC20AmountToBorrow <= getBalanceInternal(address(this), _anyERC20ContractAddressAsReserve), "Invalid balance, was the flashLoan successful?");

        //
        // Your logic goes here.
        // !! Ensure that *this contract* has enough of `_reserve` funds to payback the `_fee` !!
        //

        uint totalDebt = _thatERC20AmountToBorrow.add(_theFeeForProcessTheFlashloan);
        transferFundsBackToPoolInternal(_anyERC20ContractAddressAsReserve, totalDebt);
    }

    /**
        Flash loan 1000000000000000000 wei (1 ether) worth of `_asset`
     */
    function flashloan(address _asset) public onlyOwner {
        bytes memory data = "";
        uint amount = 1 ether;

        ILendingPool lendingPool = ILendingPool(addressesProvider.getLendingPool());
        lendingPool.flashLoan(address(this), _asset, amount, data);
    }
}
