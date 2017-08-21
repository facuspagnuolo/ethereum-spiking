pragma solidity ^0.4.11;

import './MyToken.sol';
import './TokenPurchaseAcceptance.sol';

contract TokenPurchase {
  MyToken public token;
  address public buyer;
  uint256 public amount;
  bool public tokenPurchaseOpened;

  event TokenSold(address buyer, address seller, uint256 price, uint256 amount);

  function TokenPurchase(MyToken _token, uint256 _amount) {
    if(_amount <= 0) return;

    token = _token;
    amount = _amount;
    buyer = msg.sender;
    tokenPurchaseOpened = false;
  }

  function () payable {
    uint weiAmount = msg.value;

    require(weiAmount > 0);
    require(msg.sender == buyer);

    tokenPurchaseOpened = true;
  }

  function claim(TokenPurchaseAcceptance acceptance) returns(bool){
    address seller = acceptance.seller();
    uint256 acceptanceAmount = token.balanceOf(address(acceptance));

    require(tokenPurchaseOpened);
    require(buyer == msg.sender);
    require(acceptanceAmount >= amount);

    tokenPurchaseOpened = false;

    if(acceptance.claim()) {
      uint balance = this.balance;
      seller.transfer(balance);
      TokenSold(buyer, seller, balance, amount);
      return true;
    }
    return false;
  }

  function priceInWei() constant returns(uint) {
    return this.balance;
  }
}
