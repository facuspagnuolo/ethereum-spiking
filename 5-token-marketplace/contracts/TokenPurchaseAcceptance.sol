pragma solidity ^0.4.11;

import './TokenPurchase.sol';
import '../node_modules/zeppelin-solidity/contracts/token/ERC20.sol';
import '../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';

contract TokenPurchaseAcceptance is Ownable {
  bool public claimed;
  ERC20 public token;
  TokenPurchase public tokenPurchase;

  event Claimed(address from, address to, uint256 amount);

  function TokenPurchaseAcceptance(ERC20 _token, TokenPurchase _tokenPurchase) {
    claimed = false;
    token = _token;
    tokenPurchase = _tokenPurchase;
  }

  function tokensBalance() constant returns(uint256) {
    return token.balanceOf(this);
  }

  function claim() returns(bool) {
    require(!claimed);
    require(msg.sender == address(tokenPurchase));

    claimed = true;

    address buyer = tokenPurchase.owner();
    uint256 balance = tokensBalance();
    token.transfer(buyer, balance);
    Claimed(buyer, owner, balance);
    return true;
  }
}
