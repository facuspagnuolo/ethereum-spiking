pragma solidity ^0.4.18;

import './MyToken.sol';
import './TokenPurchaseAcceptance.sol';

contract TokenPurchase {
  MyToken public token;
  address public buyer;
  uint256 public amount;
  bool public tokenPurchaseOpened;

  event TokenSold(address buyer, address seller, uint256 price, uint256 amount);

  function TokenPurchase(MyToken _token, uint256 _amount) public {
    if(_amount <= 0) return;

    token = _token;
    amount = _amount;
    buyer = msg.sender;
    tokenPurchaseOpened = false;
  }

  function priceInWei() public constant returns(uint) {
    return this.balance;
  }

  function () payable public {
    uint weiAmount = msg.value;
    require(weiAmount > 0);
    require(msg.sender == buyer);

    tokenPurchaseOpened = true;
  }

  function claim(TokenPurchaseAcceptance acceptance) public returns(bool) {
    address seller = acceptance.seller();
    uint256 acceptanceAmount = token.balanceOf(address(acceptance));

    require(tokenPurchaseOpened);
    require(buyer == msg.sender);
    require(acceptanceAmount >= amount);

    tokenPurchaseOpened = false;

    if(!acceptance.claim()) return false;
    uint balance = this.balance;
    seller.transfer(balance);
    TokenSold(buyer, seller, balance, amount);
    return true;
  }
}
