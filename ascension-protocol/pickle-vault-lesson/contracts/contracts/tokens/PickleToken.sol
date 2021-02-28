
// SPDX-License-Identifier: MIT

pragma solidity <0.9.0;

import "./erc20.sol";
import "../ownership/ownable.sol";


contract PickleToken is erc20("PickleToken", "PICKLE", 18), Ownable {
    /// @notice Creates `_amount` token to `_to`. Must only be called by the owner (MasterChef).
    function mint(address _to, uint256 _amount) public onlyOwner {
        _mint(_to, _amount);
    }
}