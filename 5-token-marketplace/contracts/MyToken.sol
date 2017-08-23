pragma solidity ^0.4.11;

import '../node_modules/zeppelin-solidity/contracts/token/StandardToken.sol';

contract MyToken is StandardToken {
  address public creator;

  function MyToken(uint256 amount) {
    creator = msg.sender;
    balances[creator] = amount;
  }

  function sendTokens(address receiver, uint256 amount) returns (bool) {
    return super.transfer(receiver, amount);
  }
}
