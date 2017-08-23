import $ from 'jquery'
import Accounts from './accounts'
import Transactions from './transactions'
import TokenPurchaseAcceptances from './tokenpurchaseacceptances'
import { GAS, showError } from "./constants"
import { ERC20, TokenPurchase } from "./contracts"

const TokenPurchases = {
  async update(tokenPurchase) {
    let address = tokenPurchase.address;
    const list = $('#token-purchase-contracts');
    const contractDetails = this._buildDetailFor(address);
    const tokenPurchaseElement = list.find(`#${address}`);
    tokenPurchaseElement.length ? tokenPurchaseElement.html(contractDetails) : list.append(`<p id="${address}">${contractDetails}</p>`);

    try {
      list.find(`#${address}`).find(".tokens").html(`Tokens ${(await tokenPurchase.amount())}`)
      list.find(`#${address}`).find(".price").html(`Wei ${(await tokenPurchase.priceInWei())}`)
      list.find(`#${address}`).find(".opened").html(`Opened ${(await tokenPurchase.tokenPurchaseOpened())}`)
    } catch(error) { showError(error) }
  },

  async publish(erc20Address, buyer, amount, value) {
    console.log(`Buying ${amount} tokens from ${buyer} by Wei ${value}`);
    try {
      const erc20 = await ERC20.at(erc20Address)
      const tokenPurchase = await TokenPurchase.new(erc20.address, amount, {from: buyer, gas: GAS})
      Transactions.add(tokenPurchase.transactionHash);

      const response = await tokenPurchase.sendTransaction({from: buyer, value: value, gas: GAS})
      Accounts.update(erc20);
      Transactions.add(response.tx);
      this.update(tokenPurchase);
    } catch(error) { showError(error) }
  },

  async apply(seller, contractAddress) {
    console.log(`Seller ${seller} applying to purchase ${contractAddress}`);
    try {
      const tokenPurchase = await TokenPurchase.at(contractAddress)
      const erc20Address = await tokenPurchase.token()
      const erc20 = await ERC20.at(erc20Address)
      const amount = await tokenPurchase.amount()
      const acceptance = await TokenPurchaseAcceptances.publish(erc20Address, contractAddress, seller)

      const response = await erc20.transfer(acceptance.address, amount, { from: seller, gas: GAS })
      Accounts.update(erc20)
      Transactions.add(response.tx)
      TokenPurchaseAcceptances.update(acceptance)
    } catch(error) { showError(error) }
  },

  _buildDetailFor(address) {
    return `<a href="#" class="select-tokenpurchase-contract">select</a> <span class="address">${address}</span> | <span class="tokens">Tokens</span> | <span class="price">Wei</span> | <span class="opened">Opened </span>`;
  },
}

export default TokenPurchases
