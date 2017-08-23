import $ from 'jquery'
import Accounts from './accounts'
import Transactions from './transactions'
import { MyToken } from "./contracts"
import { GAS, MYTOKEN_INITIAL_AMOUNT, showError } from "./constants"

const MyTokens = {
  deploy(owner) {
    MyToken.new(MYTOKEN_INITIAL_AMOUNT, { from: owner, gas: GAS }).then(myToken => {
      $('#tokensale-token-address').val(myToken.address);
      $('#tokenpurchase-token-address').val(myToken.address);
      $('#mytoken-address').html(`<b>MyToken Address: <span class=".address">${myToken.address}</span></b>`);
      Transactions.add(myToken.transactionHash);
      Accounts.update(myToken);
    }).catch(showError);
  },

  last() {
    let address = $('#mytoken-address').find('.address').text();
    return MyToken.at(address);
  }
};

export default MyTokens;
