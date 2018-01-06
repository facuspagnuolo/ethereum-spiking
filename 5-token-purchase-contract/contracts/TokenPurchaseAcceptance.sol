pragma solidity ^0.4.11;

import './MyToken.sol';
import './TokenPurchase.sol';

contract TokenPurchaseAcceptance {
  bool public claimed;
  address public seller;
  MyToken public token;
  TokenPurchase public tokenPurchase;

  event Claimed(address from, address to, uint256 amount);

  function TokenPurchaseAcceptance(MyToken _token, TokenPurchase _tokenPurchase) {
    claimed = false;
    seller = msg.sender;
    token = _token;
    tokenPurchase = _tokenPurchase;
  }

  function claim() returns(bool) {
    require(!claimed);
    require(msg.sender == address(tokenPurchase));

    claimed = true;

    address buyer = tokenPurchase.buyer();
    uint256 balance = token.balanceOf(this);
    token.sendTokens(buyer, balance);
    Claimed(buyer, seller, balance);
    return true;
  }
}
