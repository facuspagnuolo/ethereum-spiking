import contract from 'truffle-contract';
import { provider } from "./constants"

const MyToken = contract(require('../build/contracts/MyToken.json'));
MyToken.setProvider(provider);

const TokenSale = contract(require('../build/contracts/TokenSale.json'));
TokenSale.setProvider(provider);

const TokenPurchase = contract(require('../build/contracts/TokenPurchase.json'));
TokenPurchase.setProvider(provider);

const TokenPurchaseAcceptance = contract(require('../build/contracts/TokenPurchaseAcceptance.json'));
TokenPurchaseAcceptance.setProvider(provider);

export {
  MyToken,
  TokenSale,
  TokenPurchase,
  TokenPurchaseAcceptance,
}
