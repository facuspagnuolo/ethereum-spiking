pragma solidity ^0.4.4;

contract MyToken {
  address creator;
  mapping (address => uint256) balances;

  function MyToken(uint256 amount) {
    creator = msg.sender;
    balances[creator] = amount;
  }

  function sendTokens(address receiver, uint256 amount) returns (bool) {
    address owner = msg.sender;

    if (amount <= 0) return false;
    if (balances[owner] < amount) return false;

    balances[owner] -= amount;
    balances[receiver] += amount;
    return true;
  }

  function balanceOf(address owner) constant returns (uint256) {
    return balances[owner];
  }
}
