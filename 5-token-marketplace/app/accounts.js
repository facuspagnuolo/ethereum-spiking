import $ from 'jquery'
import { web3 } from "./constants"

const Accounts = {
  update(myToken = null) {
    $('#accounts').html("");
    web3.eth.accounts.forEach(async function(account) {
      await Accounts.updateAccount(account, myToken);
    })
  },

  async updateAccount(account, myToken) {
    let balance = web3.eth.getBalance(account);
    myToken ?
      await Accounts.updateAccountWithTokens(myToken, account, balance) :
      Accounts.updateAccountWithoutTokens(account, balance);
  },

  async updateAccountWithTokens(myToken, account, balance) {
    let tokens = await myToken.balanceOf(account);
    $('#accounts').append(`<p><a href="#" class="select-seller">sell</a> <a href="#" class="select-buyer">buy</a> <span class="address">${account}</span> | <span class="balance">ETH ${balance}</span> | <span class="balance">Tokens ${tokens}</span></p>`)
  },

  updateAccountWithoutTokens(account, balance) {
    $('#accounts').append(`<p><a href="#" class="deploy">Deploy MyToken</a> <span class="address">${account}</span> | <span class="balance">ETH ${balance}</span></p>`)
  },
}

export default Accounts
