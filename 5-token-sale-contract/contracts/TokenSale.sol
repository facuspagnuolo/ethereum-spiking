pragma solidity ^0.4.18;

import './MyToken.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract TokenSale is Ownable {
  MyToken public token;
  uint256 public priceInWei;
  bool public tokenSaleClosed;

  event TokenPurchase(address buyer, address seller, uint256 price, uint256 amount);

  function TokenSale(MyToken _token, uint256 _price) public {
    if (_price < 0) return;

    token = _token;
    priceInWei = _price;
    tokenSaleClosed = false;
  }

  function amount() public constant returns(uint256) {
    return token.balanceOf(this);
  }

  function () public payable {
    buyTokens(msg.sender);
  }

  function buyTokens(address buyer) public payable {
    uint256 weiAmount = msg.value;
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
