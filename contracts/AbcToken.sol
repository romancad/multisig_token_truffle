/**
 *Submitted for verification at Etherscan.io on 2021-10-04
*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;


contract AbcToken {
    string  public name = "ABC Token";
    string  public symbol = "ABC";
    string  public standard = "ABC Token v1.0";
    uint256 public totalSupply;
    address owner;


    mapping(address => uint256) public balanceOf;

    constructor () {
        owner = msg.sender;

        balanceOf[owner] = 100000000;
        totalSupply = 100000000;
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "not owner");
        _;
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value);

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        // emit Transfer(msg.sender, _to, _value);

        return true;
    }


    function transferFrom(address _from, address _to, uint256 _value) onlyOwner public returns (bool success) {
        require(_value <= balanceOf[_from]);

        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        return true;
    }
}
