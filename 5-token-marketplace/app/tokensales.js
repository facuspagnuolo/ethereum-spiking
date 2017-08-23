import $ from 'jquery'
import { GAS, showError } from "./constants"
import { MyToken, TokenSale } from "./contracts"
import Accounts from "./accounts"
import Transactions from "./transactions"

const TokenSales = {
  update(tokenSale) {
    let address = tokenSale.address;
    const list = $('#token-sale-contracts');
    const contractDetails = `<a href="#" class="select-tokensale-contract">select</a> <span class="address">${address}</span> | <span class="tokens">Tokens</span> | <span class="price">Wei</span> | <span class="closed">Closed </span></p>`;
    const tokenSaleElement = list.find(`#${address}`);

    tokenSaleElement.length ? tokenSaleElement.html(contractDetails) : list.append(`<p id="${address}">${contractDetails}</p>`);
    tokenSale.amount().then(tokens => list.find(`#${address}`).find(".tokens").html(`Tokens ${tokens}`)).catch(showError);
    tokenSale.priceInWei().then(price => list.find(`#${address}`).find(".price").html(`Wei ${price}`)).catch(showError);
    tokenSale.tokenSaleClosed().then(closed => list.find(`#${address}`).find(".closed").html(`Closed ${closed}`)).catch(showError);
  },

  publish(myTokenContractAddress, seller, amount, price) {
    console.log(`Selling ${amount} tokens at ${myTokenContractAddress} from ${seller} by Wei ${price}`);

    MyToken.at(myTokenContractAddress).then(myToken => {
      TokenSale.new(myTokenContractAddress, price, { from: seller, gas: GAS }).then(tokenSale => {
        this.update(tokenSale);
        Accounts.update();
        Transactions.add(tokenSale.transactionHash);
        myToken.transfer(tokenSale.address, amount, { from: seller, gas: GAS }).then(response => {
          this.update(tokenSale);
          Accounts.update(myToken);
          Transactions.add(response.tx);
        }).catch(showError);
      }).catch(showError);
    }).catch(showError);
  },

  apply(contractAddress, buyer) {
    TokenSale.at(contractAddress).then(tokenSale => {
      tokenSale.token().then(myTokenAddress => {
        MyToken.at(myTokenAddress).then(myToken => {
          tokenSale.priceInWei().then(weiAmount => {
            console.log(`Buying tokens from ${buyer} by Wei ${weiAmount}`);
            tokenSale.sendTransaction({ from: buyer, value: weiAmount }).then(response => {
              Accounts.update(myToken);
              Transactions.add(response.tx);
              this.update(tokenSale);
            }).catch(showError);
          }).catch(showError);
        }).catch(showError);
      }).catch(showError);
    }).catch(showError);
  }
};

export default TokenSales;
