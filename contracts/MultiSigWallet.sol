/**
 *Submitted for verification at Etherscan.io on 2021-10-04
*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import './AbcToken.sol';

contract MultiSigWallet {
    
    AbcToken public abcToken;
    
    event Deposit(address indexed sender, uint amount);
    event Submit(uint indexed txId);
    event Confirm(address indexed owner, uint indexed txId);
    event Revoke(address indexed owner, uint indexed txId);
    event Execute(uint indexed txId);

    address[5] public owners;
    mapping(address => bool) public isOwner;
    uint8 constant SIG_NEEDED = 3;

    struct Transaction {
        address to;
        uint value;
        bytes data;
        bool executed;
    }

    // mapping from tx index => owner => bool
    mapping(uint => mapping(address => bool)) public confirmations;
    Transaction[] public transactions;

    modifier onlyOwner() {
        require(isOwner[msg.sender], "not owner"); // !!!!!!!!!!!!!!!!!!!!!!!!!!!!
        _;
    }

    modifier txExists(uint _txId) {
        require(_txId < transactions.length, "transaction does not exist");
        _;
    }

    modifier notExecuted(uint _txId) {
        require(!transactions[_txId].executed, "transaction already executed");
        _;
    }

    modifier notConfirmed(uint _txId) {
        require(!confirmations[_txId][msg.sender], "transaction  already confirmed");
        _;
    }

    constructor(AbcToken _abcToken){

        abcToken = _abcToken;

    
        owners[0] = 0x2d1E77731a655696548Ef819308516b7acDcE8cc; // TEST WALLET 1
        owners[1] = 0xc93276555e7A4ba35A32F9d37843fFA7609B3437; // 2
        owners[2] = 0x98ed1d05aF173B2eA145e0DCf79505def21cE623; // 3
        owners[3] = 0x4aF2a8AdBcffA922Ee75C2Fc52885B26D41879a0; // 4
        owners[4] = 0xe03AdE230dFad08afD4614201a2D098631D9C124; // 5

        for (uint8 i = 0; i < 5; i++) { 
            isOwner[owners[i]] = true;
        }
    }

/*
    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

*/

    function submit(
        address _to,
        uint _value,
        bytes calldata _data
    ) external onlyOwner returns (uint){
        uint txId = transactions.length;
        transactions.push(Transaction({to: _to, value: _value, data: _data, executed: false}));
        // emit Submit(txId);
        return txId;
    }

    function getConfirmationCount(uint _txId) public view returns (uint) {
        uint count = 0;
        for (uint i = 0; i < owners.length; i++) {
            if (confirmations[_txId][owners[i]]) {
                count += 1;
            }
        }
        return count;
    }


    function execute(uint _txId) public onlyOwner txExists(_txId) notExecuted(_txId) {
        Transaction storage transaction = transactions[_txId];
        require(_getConfirmationCount(_txId) >= SIG_NEEDED, "confirmations < required");

        transaction.executed = true;

        // (bool success, ) = transaction.to.call{value: transaction.value}(transaction.data);
        bool success = abcToken.transfer(transaction.to, transaction.value);
        require(success, "tx failed");

        emit Execute(_txId);
    }


    function confirm(uint _txId) external onlyOwner txExists(_txId) notExecuted(_txId) notConfirmed(_txId) {
        confirmations[_txId][msg.sender] = true;
        emit Confirm(msg.sender, _txId);

        if (_getConfirmationCount(_txId) >= SIG_NEEDED) { 
            execute(_txId);
        }

    }

    function revoke(uint _txId) external onlyOwner txExists(_txId) notExecuted(_txId) {
        require(confirmations[_txId][msg.sender], "tx not confirmed");
        confirmations[_txId][msg.sender] = false;
        emit Revoke(msg.sender, _txId);
    }
}