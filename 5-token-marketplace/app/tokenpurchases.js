import $ from 'jquery'
import Accounts from './accounts'
import Transactions from './transactions'
import { GAS, showError } from "./constants"
import { MyToken, TokenPurchase, TokenPurchaseAcceptance } from "./contracts"

const TokenPurchases = {
  update(tokenPurchase) {
    let address = tokenPurchase.address;
    const list = $('#token-purchase-contracts');
    const contractDetails = `<a href="#" class="select-tokenpurchase-contract">select</a> <span class="address">${address}</span> | <span class="tokens">Tokens</span> | <span class="price">Wei</span> | <span class="opened">Opened </span>`;
    const tokenPurchaseElement = list.find(`#${address}`);

    tokenPurchaseElement.length ? tokenPurchaseElement.html(contractDetails) : list.append(`<p id="${address}">${contractDetails}</p>`);
    tokenPurchase.amount().then(tokens => list.find(`#${address}`).find(".tokens").html(`Tokens ${tokens}`)).catch(showError);
    tokenPurchase.priceInWei().then(price => list.find(`#${address}`).find(".price").html(`Wei ${price}`)).catch(showError);
    tokenPurchase.tokenPurchaseOpened().then(opened => list.find(`#${address}`).find(".opened").html(`Opened ${opened}`)).catch(showError);
  },

  updateAcceptance(acceptance) {
    let address = acceptance.address;
    const list = $('#token-purchase-acceptance-contracts');
    const contractDetails = `<a href="#" class="claim-acceptance">claim</a> <span class="address">${address}</span> | <span class="tokens">Tokens</span> | <span class="claimed">Claimed </span>`;
    const acceptanceElement = list.find(`#${address}`);

    acceptanceElement.length ? acceptanceElement.html(contractDetails) : list.append(`<p id="${address}">${contractDetails}</p>`);
    acceptance.tokensBalance().then(tokens => list.find(`#${address}`).find(".tokens").html(`Tokens ${tokens}`)).catch(showError);
    acceptance.claimed().then(claimed => list.find(`#${address}`).find(".claimed").html(`Claimed ${claimed}`)).catch(showError);
  },

  publish(myTokenContractAddress, buyer, amount, value) {
    console.log(`Buying ${amount} tokens from ${buyer} by Wei ${value}`);
    MyToken.at(myTokenContractAddress).then(myToken => {
      TokenPurchase.new(myToken.address, amount, { from: buyer, gas: GAS }).then(tokenPurchase => {
        tokenPurchase.sendTransaction({ from: buyer, value: value, gas: GAS }).then(response => {
          Accounts.update(myToken);
          Transactions.add(response.tx);
          this.update(tokenPurchase);
        }).catch(showError);
      }).catch(showError);
    }).catch(showError);
  },

  apply(seller, contractAddress) {
    console.log(`Seller ${seller} applying to purchase ${contractAddress}`);
    TokenPurchase.at(contractAddress).then(tokenPurchase => {
      tokenPurchase.token().then(myTokenAddress => {
        MyToken.at(myTokenAddress).then(myToken => {
          tokenPurchase.amount().then(amount => {
            TokenPurchaseAcceptance.new(myToken.address, tokenPurchase.address, { from: seller, gas: GAS }).then(acceptance => {
              Accounts.update(myToken);
              Transactions.add(acceptance.transactionHash);
              this.updateAcceptance(acceptance);
              myToken.transfer(acceptance.address, amount, { from: seller, gas: GAS }).then(response => {
                Accounts.update(myToken);
                Transactions.add(response.tx);
                this.updateAcceptance(acceptance);
              }).catch(showError);
            }).catch(showError);
          }).catch(showError);
        }).catch(showError);
      }).catch(showError);
    }).catch(showError);
  },

  claim(acceptanceAddress) {
    TokenPurchaseAcceptance.at(acceptanceAddress).then(acceptance => {
      acceptance.token().then(myTokenAddress => {
        MyToken.at(myTokenAddress).then(myToken => {
          acceptance.tokenPurchase().then(tokenPurchaseAddress => {
            TokenPurchase.at(tokenPurchaseAddress).then(tokenPurchase => {
              tokenPurchase.buyer().then(buyerAddress => {
                console.log(`Buyer ${buyerAddress} claiming ${tokenPurchaseAddress} through acceptance ${acceptance.address}`);
                tokenPurchase.claim(acceptance.address, { from: buyerAddress, gas: GAS }).then(response => {
                  Accounts.update(myToken);
                  Transactions.add(response.tx);
                  this.update(tokenPurchase);
                  this.updateAcceptance(acceptance);
                }).catch(showError);
              }).catch(showError);
            }).catch(showError);
          }).catch(showError);
        }).catch(showError);
      }).catch(showError);
    }).catch(showError);
  }
};

export default TokenPurchases;
