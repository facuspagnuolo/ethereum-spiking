pragma solidity ^0.4.11;

import '../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';
import '../node_modules/zeppelin-solidity/contracts/token/StandardToken.sol';

contract MyToken is StandardToken, Ownable {
  function MyToken(uint256 amount) {
    balances[owner] = amount;
  }
}
