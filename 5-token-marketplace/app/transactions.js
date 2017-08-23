import $ from 'jquery'
import { web3, showError } from "./constants"

const Transactions = {
  add(txHash) {
    $('#transactions-list').append(`<p><a href="#" class="transaction">${txHash}</a></p>`);
  },

  show(txHash) {
    web3.eth.getTransaction(txHash, function(error, transactionInfo) {
      if(error) showError(error);
      else {
        $("#transaction-info").find("#hash").text(transactionInfo.hash);
        $("#transaction-info").find("#nonce").text(transactionInfo.nonce);
        $("#transaction-info").find("#block-hash").text(transactionInfo.blockHash);
        $("#transaction-info").find("#block-number").text(transactionInfo.blockNumber);
        $("#transaction-info").find("#gas-usage").text(transactionInfo.gas);
        $("#transaction-info").find("#transaction-index").text(transactionInfo.transactionIndex);
        $("#transaction-info").find("#from").text(transactionInfo.from);
        $("#transaction-info").find("#to").text(transactionInfo.to);
        $("#transaction-info").find("#value").text(transactionInfo.value);
      }
    });
  }
};

export default Transactions
