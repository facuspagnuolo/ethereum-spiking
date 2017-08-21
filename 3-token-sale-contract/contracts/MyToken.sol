pragma solidity ^0.4.11;

contract MyToken {
  address public creator;
  mapping (address => uint256) public balances;

  event Log(string message, uint256 amount, uint256 balance);
  event TokenTransfer(address from, address to, uint256 amount);

  function MyToken(uint256 amount) {
    creator = msg.sender;
    balances[creator] = amount;
  }

  function sendTokens(address receiver, uint256 amount) returns (bool) {
    address owner = msg.sender;

    if (amount <= 0) return false;
    if (balances[owner] < amount) return false;

    balances[owner] = balances[owner] - amount;
    balances[receiver] = balances[receiver] + amount;
    TokenTransfer(owner, receiver, amount);
    return true;
  }

  function balanceOf(address owner) constant returns (uint256) {
    return balances[owner];
  }
}
