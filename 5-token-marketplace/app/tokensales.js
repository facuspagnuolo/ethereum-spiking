import $ from 'jquery'
import { GAS, showError } from "./constants"
import { MyToken, TokenSale } from "./contracts"
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
      list.find(`#${address}`).find(".closed").html(`Closed ${(await tokenSale.tokenSaleClosed())}`)
    } catch(error) { showError(error) }
  },

  async publish(myTokenContractAddress, seller, amount, price) {
    console.log(`Selling ${amount} tokens at ${myTokenContractAddress} from ${seller} by Wei ${price}`)
    try {
      const myToken = await MyToken.at(myTokenContractAddress)
      const tokenSale = await TokenSale.new(myTokenContractAddress, price, { from: seller, gas: GAS })
      Transactions.add(tokenSale.transactionHash)

      const response = await myToken.transfer(tokenSale.address, amount, { from: seller, gas: GAS })
      this.update(tokenSale)
      Accounts.update(myToken)
      Transactions.add(response.tx)
    } catch(error) { showError(error) }
  },

  async apply(contractAddress, buyer) {
    try {
      const tokenSale = await TokenSale.at(contractAddress)
      const myTokenAddress = await tokenSale.token()
      const myToken = await MyToken.at(myTokenAddress)
      const weiAmount = await tokenSale.priceInWei()

      console.log(`Buying tokens from ${buyer} by Wei ${weiAmount}`)
      const response = await tokenSale.sendTransaction({from: buyer, value: weiAmount})
      Accounts.update(myToken)
      Transactions.add(response.tx)
      this.update(tokenSale)
    } catch(error) { showError(error) }
  },

  _buildDetail(address) {
    return `<a href="#" class="select-tokensale-contract">select</a> <span class="address">${address}</span> | <span class="tokens">Tokens</span> | <span class="price">Wei</span> | <span class="closed">Closed </span>`;
  },
}

export default TokenSales
