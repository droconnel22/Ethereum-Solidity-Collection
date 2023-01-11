// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract MultiSigWallet {
    event Deposit(address indexed sender, uint amount);
    event Submit(uint indexed txId);
    event Approve(address indexed ower, uint indexed txId);
    event Revoke(address indexed owner, uint indexed txId);
    event Execute(uint indexed txId);

    address[] public owners;
    mapping(address => bool) public isOwner;
    uint public requiredApprovals;

    struct Transaction {
        address to;
        uint value;
        bytes data;
        bool executed;
    }

    Transaction[] public transactions;
    mapping(uint => mapping(address => bool)) public transactionApprovals;

    modifier onlyOwner() {
        require(isOwner[msg.sender], "not owner");
        _;
    }

    modifier txExists(uint _txId) {
        require(_txId < transactions.length, "tx does not exist");
        _;
    }

    modifier notApproved(uint _txId) {
        require(!transactionApprovals[_txId][msg.sender], "tx already approved");
        _;
    }

    modifier notExecuted(uint _txId) {
        require(!transactions[_txId].executed, "Tx already executed");
        _;
    }

    constructor(address[] memory _owners, uint _required) {
        require(_owners.length > 0 , "owners required");
        require(_required > 0 && _required <= _owners.length, "invalid require");

        for(uint i; i < _owners.length; i++){
            address owner = _owners[i];
            require(owner != address(0), "invalid owner");
            require(!isOwner[owner], "duplicate owner");
            isOwner[owner] = true;
            owners.push(owner);
        }

        requiredApprovals = _required;
    }

    function receieve() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    function submit(address _to, uint _value, bytes calldata _data) 
        external
        onlyOwner
    {
        transactions.push(Transaction({
            to: _to,
            value: _value,
            data: _data,
            executed: false
        }));
        emit Submit(transactions.length -1);
    }

    function approve(uint _txId) 
        external  
        onlyOwner 
        txExists(_txId)
        notApproved(_txId)
        notExecuted(_txId)
    {
        transactionApprovals[_txId][msg.sender] = true;
        emit Approve(msg.sender, _txId);
    }

    function _getApprovalCount(uint _txId) private view returns (uint count) {
        for(uint i; i < owners.length; i++){
            if(transactionApprovals[_txId][owners[i]]) {
                count +=1;
            }
        }
    }

    function execute(uint _txId) 
        external 
        txExists(_txId)
        notExecuted(_txId)
    {
        require(_getApprovalCount(_txId) >= requiredApprovals, "Need more approvals");
        Transaction storage transaction = transactions[_txId];
        transaction.executed = true;
        (bool success, ) = transaction.to.call{value: transaction.value}(transaction.data);
        require(success, "transaction failed");

        emit Execute(_txId);
    }

    function revoke(uint _txId) 
        external 
        onlyOwner 
        txExists(_txId)
        notExecuted(_txId)
    {
        require(transactionApprovals[_txId][msg.sender], "msg not approved");
        transactionApprovals[_txId][msg.sender] = false;
        emit Revoke(msg.sender, _txId);
    }
}
