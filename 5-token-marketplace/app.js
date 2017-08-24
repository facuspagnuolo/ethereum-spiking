require('babel-register');
require('babel-polyfill');

import $ from 'jquery';
import Accounts from './app/accounts'
import MyTokens from './app/mytokens'
import TokenSales from './app/tokensales'
import Transactions from "./app/transactions";
import TokenPurchases from './app/tokenpurchases'

Accounts.update();

$(document).on('click', '.deploy', e => {
  e.preventDefault();
  let owner = $(e.target).siblings(".address").text();
  MyTokens.deploy(owner);
});

$(document).on('click', '.select-buyer', e => {
  e.preventDefault();
  let buyer = $(e.target).siblings(".address").text();
  $('#tokensale-buyer-address').val(buyer);
  $('#tokenpurchase-buyer-address').val(buyer);
});

$(document).on('click', '.select-seller', e => {
  e.preventDefault();
  let seller = $(e.target).siblings(".address").text();
  $('#tokensale-seller-address').val(seller);
  $('#tokenpurchase-seller-address').val(seller);
});

$(document).on('click', '.select-tokenpurchase-contract', e => {
  e.preventDefault();
  let contractAddress = $(e.target).siblings(".address").text();
  $('#tokenpurchase-contract-address').val(contractAddress);
});

$(document).on('click', '.select-tokensale-contract', e => {
  e.preventDefault();
  let contractAddress = $(e.target).siblings(".address").text();
  $('#tokensale-contract-address').val(contractAddress);
});

$(document).on('click', '.transaction', e => {
  e.preventDefault();
  let transactionHash = $(event.target).text();
  Transactions.show(transactionHash);
});

$('#sell').click(() => {
  let price = $('#tokensale-price').val();
  let amount = $('#tokensale-amount').val();
  let sellerAddress = $('#tokensale-seller-address').val();
  let tokenContractAddress = $('#tokensale-token-address').val();
  TokenSales.publish(tokenContractAddress, sellerAddress, amount, price);
});

$('#apply-sell').click(() => {
  let buyerAddress = $('#tokensale-buyer-address').val();
  let tokenSaleContractAddress = $('#tokensale-contract-address').val();
  TokenSales.apply(tokenSaleContractAddress, buyerAddress);
});

$('#buy').click(() => {
  let amount = $('#tokenpurchase-amount').val();
  let price = $('#tokenpurchase-price').val();
  let buyerAddress = $('#tokenpurchase-buyer-address').val();
  let tokenContractAddress = $('#tokenpurchase-token-address').val();
  TokenPurchases.publish(tokenContractAddress, buyerAddress, amount, price);
});

$('#apply-buy').click(() => {
  let sellerAddress = $('#tokenpurchase-seller-address').val();
  let tokenPurchaseContractAddress = $('#tokenpurchase-contract-address').val();
  TokenPurchases.apply(sellerAddress, tokenPurchaseContractAddress);
});

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    }
  }
};
