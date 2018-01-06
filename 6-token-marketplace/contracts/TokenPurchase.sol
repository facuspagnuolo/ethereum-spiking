pragma solidity ^0.4.11;

import '../node_modules/zeppelin-solidity/contracts/token/ERC20.sol';
import '../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';

contract TokenPurchase is Ownable {
  ERC20 public token;
  uint256 public amount;
  bool public opened;

  event TokenSold(address buyer, address seller, uint256 price, uint256 amount);

  function TokenPurchase(ERC20 _token, uint256 _amount) {
    if(_amount <= 0) return;

    token = _token;
    amount = _amount;
    opened = false;
  }

  function priceInWei() constant returns(uint) {
    return this.balance;
  }

  function () payable onlyOwner {
    require(msg.value > 0);

    opened = true;
  }

  function claim() returns(bool){
    address seller = msg.sender;
    uint256 allowedTokens = token.allowance(seller, address(this));

    require(opened);
    require(allowedTokens >= amount);

    opened = false;

    if(!token.transferFrom(seller, owner, amount)) revert();
    uint balance = this.balance;
    seller.transfer(balance);
    TokenSold(owner, seller, balance, amount);
    return true;
  }
}
