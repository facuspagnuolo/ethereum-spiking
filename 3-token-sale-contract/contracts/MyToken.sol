pragma solidity ^0.4.11;

contract MyToken {
  address public creator;
  mapping (address => uint256) public balances;

  event TokenTransfer(address from, address to, uint256 amount);

  function MyToken(uint256 amount) {
    creator = msg.sender;
    balances[creator] = amount;
  }

  function sendTokens(address receiver, uint256 amount) returns (bool) {
    address owner = msg.sender;

    require(amount > 0);
    require(balances[owner] >= amount);

    balances[owner] -= amount;
    balances[receiver] += amount;
    TokenTransfer(owner, receiver, amount);
    return true;
  }

  function balanceOf(address owner) constant returns (uint256) {
    return balances[owner];
  }
}
