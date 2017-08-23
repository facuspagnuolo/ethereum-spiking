pragma solidity ^0.4.11;

import '../node_modules/zeppelin-solidity/contracts/token/ERC20.sol';
import '../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';

contract TokenSale is Ownable {
  ERC20 public token;
  uint public priceInWei;
  bool public tokenSaleClosed;

  event TokenPurchase(address buyer, address seller, uint256 price, uint256 amount);

  function TokenSale(ERC20 _token, uint _price) {
    if (_price < 0) return;

    token = _token;
    priceInWei = _price;
    tokenSaleClosed = false;
  }

  function amount() constant returns(uint256) {
    return token.balanceOf(this);
  }

  function seller() constant returns(address) {
    return owner;
  }

  function () payable {
    buyTokens(msg.sender);
  }

  function buyTokens(address buyer) payable {
    uint weiAmount = msg.value;
    uint256 amount = token.balanceOf(this);

    require(amount > 0);
    require(!tokenSaleClosed);
    require(weiAmount == priceInWei);

    tokenSaleClosed = true;

    if(token.transfer(buyer, amount)) {
      owner.transfer(weiAmount);
      TokenPurchase(buyer, owner, weiAmount, amount);
    }
  }
}
