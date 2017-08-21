pragma solidity ^0.4.11;

import './MyToken.sol';

contract TokenSale {
  MyToken public token;
  address public seller;
  uint public priceInWei;
  bool public tokenSaleClosed;

  event TokenPurchase(address buyer, address seller, uint256 price, uint256 amount);

  function TokenSale(MyToken _token, uint _price) {
    if (_price < 0) return;

    token = _token;
    seller = msg.sender;
    priceInWei = _price;
    tokenSaleClosed = false;
  }

  function amount() constant returns(uint256) {
    return token.balanceOf(this);
  }

  function () payable {
    buyTokens(msg.sender);
  }

  function buyTokens(address buyer) payable {
    uint weiAmount = msg.value;
    uint256 amount = token.balanceOf(this);

    if (amount <= 0) return;
    if (tokenSaleClosed) return;
    if (weiAmount != priceInWei) return;

    tokenSaleClosed = true;

    if(token.sendTokens(buyer, amount)) {
      seller.transfer(weiAmount);
      TokenPurchase(buyer, seller, weiAmount, amount);
    }
  }
}
