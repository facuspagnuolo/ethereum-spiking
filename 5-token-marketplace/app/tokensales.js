import $ from 'jquery'
import { GAS, showError } from "./constants"
import { ERC20, TokenSale } from "./contracts"
import Accounts from "./accounts"
import Transactions from "./transactions"

const TokenSales = {
  async update(tokenSale) {
    let address = tokenSale.address
    const list = $('#token-sale-contracts')
    const contractDetails = this._buildDetail(address)
    const tokenSaleElement = list.find(`#${address}`)
    tokenSaleElement.length ? tokenSaleElement.html(contractDetails) : list.append(`<p id="${address}">${contractDetails}</p>`)

    try {
      list.find(`#${address}`).find(".tokens").html(`Tokens ${(await tokenSale.amount())}`)
      list.find(`#${address}`).find(".price").html(`Wei ${(await tokenSale.priceInWei())}`)
      list.find(`#${address}`).find(".closed").html(`Closed ${(await tokenSale.closed())}`)
    } catch(error) { showError(error) }
  },

  async publish(erc20Address, seller, amount, price) {
    console.log(`Selling ${amount} tokens at ${erc20Address} from ${seller} by Wei ${price}`)
    try {
      const erc20 = await ERC20.at(erc20Address)
      const tokenSale = await TokenSale.new(erc20Address, price, { from: seller, gas: GAS })
      Transactions.add(tokenSale.transactionHash)

      const response = await erc20.transfer(tokenSale.address, amount, { from: seller, gas: GAS })
      this.update(tokenSale)
      Accounts.update(erc20)
      Transactions.add(response.tx)
    } catch(error) { showError(error) }
  },

  async apply(contractAddress, buyer) {
    try {
      const tokenSale = await TokenSale.at(contractAddress)
      const erc20Address = await tokenSale.token()
      const erc20 = await ERC20.at(erc20Address)
      const weiAmount = await tokenSale.priceInWei()

      console.log(`Buying tokens from ${buyer} by Wei ${weiAmount}`)
      const response = await tokenSale.sendTransaction({from: buyer, value: weiAmount})
      Accounts.update(erc20)
      Transactions.add(response.tx)
      this.update(tokenSale)
    } catch(error) { showError(error) }
  },

  _buildDetail(address) {
    return `<a href="#" class="select-tokensale-contract">select</a> <span class="address">${address}</span> | <span class="tokens">Tokens</span> | <span class="price">Wei</span> | <span class="closed">Closed </span>`;
  },
}

export default TokenSales
