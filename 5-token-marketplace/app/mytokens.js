import $ from 'jquery'
import Accounts from './accounts'
import Transactions from './transactions'
import { MyToken } from "./contracts"
import { GAS, MYTOKEN_INITIAL_AMOUNT, showError } from "./constants"

const MyTokens = {
  async deploy(owner) {
    try {
      let myToken = await MyToken.new(MYTOKEN_INITIAL_AMOUNT, { from: owner, gas: GAS })
      $('#tokensale-token-address').val(myToken.address)
      $('#tokenpurchase-token-address').val(myToken.address)
      $('#mytoken-address').html(`<b>MyToken Address: <span class=".address">${myToken.address}</span></b>`)
      Transactions.add(myToken.transactionHash)
      Accounts.update(myToken)
    } catch(error) { showError(error) }
  },

  async last() {
    let address = $('#mytoken-address').find('.address').text()
    try {
      return await MyToken.at(address)
    } catch(error) { showError(error) }
  }
}

export default MyTokens
