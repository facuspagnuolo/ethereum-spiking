pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/token/ERC20.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract TokenSale is Ownable {
  ERC20 public token;
  uint public priceInWei;
  bool public closed;

  event TokenPurchase(address buyer, address seller, uint256 price, uint256 amount);

  function TokenSale(ERC20 _token, uint _price) public {
    if (_price < 0) revert();

    token = _token;
    priceInWei = _price;
    closed = false;
  }

  function amount() public constant returns(uint256) {
    return token.balanceOf(this);
  }

  function () public payable {
    buyTokens(msg.sender);
  }

  function buyTokens(address buyer) public payable {
    uint weiAmount = msg.value;
    uint256 amount = token.balanceOf(this);

    require(amount > 0);
    require(!closed);
    require(weiAmount == priceInWei);

    closed = true;

    if(!token.transfer(buyer, amount)) revert();
    owner.transfer(weiAmount);
    TokenPurchase(buyer, owner, weiAmount, amount);
  }
}
