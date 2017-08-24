import contract from 'truffle-contract';
import { provider } from "./constants"

const MyToken = contract(require('../build/contracts/MyToken.json'));
MyToken.setProvider(provider);

const ERC20 = contract(require('../build/contracts/ERC20.json'));
ERC20.setProvider(provider);

const TokenSale = contract(require('../build/contracts/TokenSale.json'));
TokenSale.setProvider(provider);

const TokenPurchase = contract(require('../build/contracts/TokenPurchase.json'));
TokenPurchase.setProvider(provider);

export {
  MyToken,
  ERC20,
  TokenSale,
  TokenPurchase,
}
