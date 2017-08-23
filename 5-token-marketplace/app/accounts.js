import $ from 'jquery'
import { web3 } from "./constants"

const Accounts = {
  update(erc20 = null) {
    $('#accounts').html("");
    web3.eth.accounts.forEach(async function(account) {
      await Accounts.updateAccount(account, erc20);
    })
  },

  async updateAccount(account, erc20) {
    let balance = web3.eth.getBalance(account);
    erc20 ?
      await Accounts.updateAccountWithTokens(erc20, account, balance) :
      Accounts.updateAccountWithoutTokens(account, balance);
  },

  async updateAccountWithTokens(erc20, account, balance) {
    let tokens = await erc20.balanceOf(account);
    $('#accounts').append(`<p><a href="#" class="select-seller">sell</a> <a href="#" class="select-buyer">buy</a> <span class="address">${account}</span> | <span class="balance">ETH ${balance}</span> | <span class="balance">Tokens ${tokens}</span></p>`)
  },

  updateAccountWithoutTokens(account, balance) {
    $('#accounts').append(`<p><a href="#" class="deploy">Deploy MyToken</a> <span class="address">${account}</span> | <span class="balance">ETH ${balance}</span></p>`)
  },
}

export default Accounts
