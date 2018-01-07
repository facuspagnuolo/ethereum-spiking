pragma solidity ^0.4.18;

import './MyToken.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract TokenPurchase is Ownable {
  MyToken public token;
  uint256 public amount;
  bool public opened;

  event TokenSold(address buyer, address seller, uint256 price, uint256 amount);

  function TokenPurchase(MyToken _token, uint256 _amount) public {
    if(_amount <= 0) return;

    token = _token;
    amount = _amount;
    opened = false;
  }

  function priceInWei() public constant returns(uint256) {
    return this.balance;
  }

  function () public payable onlyOwner {
    require(msg.value > 0);

    opened = true;
  }

  function claim() public returns(bool) {
    address seller = msg.sender;
    uint256 allowedTokens = token.allowance(seller, address(this));

    require(opened);
    require(allowedTokens >= amount);

    opened = false;

    if(!token.transferFrom(seller, owner, amount)) revert();
    uint256 balance = this.balance;
    seller.transfer(balance);
    TokenSold(owner, seller, balance, amount);
    return true;
  }
}
