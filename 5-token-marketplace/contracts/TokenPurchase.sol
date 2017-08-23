pragma solidity ^0.4.11;

import './TokenPurchaseAcceptance.sol';
import '../node_modules/zeppelin-solidity/contracts/token/ERC20.sol';
import '../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';

contract TokenPurchase is Ownable {
  ERC20 public token;
  uint256 public amount;
  bool public tokenPurchaseOpened;

  event TokenSold(address buyer, address seller, uint256 price, uint256 amount);

  function TokenPurchase(ERC20 _token, uint256 _amount) {
    if(_amount <= 0) return;

    token = _token;
    amount = _amount;
    tokenPurchaseOpened = false;
  }

  function priceInWei() constant returns(uint) {
    return this.balance;
  }

  function () payable onlyOwner {
    require(msg.value > 0);

    tokenPurchaseOpened = true;
  }

  function claim(TokenPurchaseAcceptance acceptance) onlyOwner returns(bool){
    address seller = acceptance.owner();
    uint256 acceptanceAmount = token.balanceOf(address(acceptance));

    require(tokenPurchaseOpened);
    require(acceptanceAmount >= amount);

    tokenPurchaseOpened = false;

    if(!acceptance.claim()) revert();
    uint balance = this.balance;
    seller.transfer(balance);
    TokenSold(owner, seller, balance, amount);
    return true;
  }
}
