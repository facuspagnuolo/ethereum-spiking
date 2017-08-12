pragma solidity ^0.4.11;

contract MyToken {
  address seller;
  mapping (address => uint256) balances;

  function MyToken(uint256 amount) {
    seller = msg.sender;
    balances[seller] = amount;
  }

  function sendTokens(address receiver, uint256 amount) returns (bool) {
    if (amount <= 0) return false;
    if (balances[msg.sender] < amount) return false;
    balances[msg.sender] -= amount;
    balances[receiver] += amount;
    return true;
  }

  function balanceOf(address owner) returns (uint256) {
    return balances[owner];
  }
}
