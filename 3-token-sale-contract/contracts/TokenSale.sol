pragma solidity ^0.4.11;

import './MyToken.sol';

contract TokenSale {
  MyToken public token;
  address public seller;
  bool public tokenSaleClosed;
  uint256 public priceInEther;
  uint256 public amountOfTokens;

  function TokenSale(MyToken _token, uint256 _amountOfTokens, uint256 _price) {
    if (_price <= 0) return;
    if (_amountOfTokens <= 0) return;
    token = _token;
    seller = msg.sender;
    priceInEther = _price * 1 ether;
    amountOfTokens = _amountOfTokens;
    tokenSaleClosed = false;
  }

  function () payable {
    address buyer = msg.sender;
    uint amountInEther = msg.value;

    if (tokenSaleClosed) return;
    if (amountInEther < priceInEther) return;
    if (token.balanceOf(seller) < amountOfTokens) return;

    token.sendTokens(buyer, amountOfTokens);
    seller.transfer(amountInEther);
    tokenSaleClosed = true;
  }
}
