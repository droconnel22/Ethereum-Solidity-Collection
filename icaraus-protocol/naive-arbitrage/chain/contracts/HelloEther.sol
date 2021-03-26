// SPDX-License-Identifier: MIT

pragma solidity >=0.5.0 <0.9.0;

contract MyEtherContract {
    
    mapping(address => uint256) _balances;
    
    function invest() external payable {
        if(msg.value < 1 wei){
            revert();
        }
        
        _balances[msg.sender] += msg.value;
    }
    
    function balance() external view returns (uint256){
        return address(this).balance;
    }

    function sendEth(address payable _recipient, uint256 _amount) external {
        require(address(this).balance >=_amount, "!senderbalance");
        
        // transfer to recipent from smart contract
        // send comes back with an error, use transfer over send
        _recipient.transfer(_amount);
    }
}