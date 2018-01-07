import $ from 'jquery';
import Web3 from 'web3';
import contract from 'truffle-contract';

// Instance Web3 using localhost testrpc
const provider = new Web3.providers.HttpProvider("http://localhost:9545");
const web3 = new Web3(provider);

// Set up contracts APIs
const MyToken = contract(require('./build/contracts/MyToken.json'));
const TokenPurchase = contract(require('./build/contracts/TokenPurchase.json'));
MyToken.setProvider(provider);
TokenPurchase.setProvider(provider);

// Default variables
let myToken = null;                  // we will keep a reference of the contract once deployed
const GAS = 1000000;                 // amount of gas to use for the transaction

// Function to show an error message
const showError = error => {
  console.error(error);
  $("#errors").text(error);
};

// Function that should be called every time we do a transaction to add it to the list
const addTransaction = txHash => $('#transactions-list').append(`<p><a href="#" class="transaction">${txHash}</a></p>`);

// We will use this function to show the status of our accounts, their balances and amount of tokens
const synchAccounts = () => {
  $('#default-account').html(`<b>Default Account: ${web3.eth.defaultAccount}</b>`);
  $('#accounts').html("");
  web3.eth.accounts.forEach(account => {
    let balance = web3.eth.getBalance(account);
    if (myToken) {
      myToken.balanceOf(account).then(tokens => {
        $('#accounts').append(`<p><a href="#" class="sell">sell</a> <a href="#" class="buy">buy</a> <span class="address">${account}</span> | <span class="balance">ETH ${balance}</span> | <span class="balance">Tokens ${tokens}</span></p>`);
      }).catch(showError);
    } else {
      $('#accounts').append(`<p><a href="#" class="deploy">Deploy MyToken</a> <span class="address">${account}</span> | <span class="balance">ETH ${balance}</span></p>`);
    }
  });
};

// We will use this function in order to deploy MyToken contract from an owner account. We will use it just once
const deployMyToken = event => {
  event.preventDefault();
  let address = $(event.target).siblings(".address").text();
  MyToken.new({ from: address, gas: GAS }).then(instance => {
    myToken = instance;
    $('#mytoken-address').html(`<b>MyToken Address: ${instance.address}</b>`);
    $('#mytoken-contract-address').val(instance.address);
    addTransaction(instance.transactionHash);
    synchAccounts();
  }).catch(showError);
};

// This callback just avoids us to copy & past every time we want to sell tokens from an address
const updateSellingFormWithAddress = event => {
  event.preventDefault();
  let address = $(event.target).siblings(".address").text();
  $('#seller-address').val(address);
};

// This callback just avoids us to copy & past every time we want to buy tokens from an address
const updateBuyingFormWithAddress = event => {
  event.preventDefault();
  let address = $(event.target).siblings(".address").text();
  $('#buyer-address').val(address);
};

// This callback just avoids us to copy & past every time we want to apply for a token purchase contract
const updateSellingFormWithContract = event => {
  event.preventDefault();
  let address = $(event.target).siblings(".address").text();
  $('#tokenpurchase-contract-address').val(address);
};

// We will use this function in order to update the status of a token purchase contracts
const updateTokenPurchaseContractStatus = tokenPurchase => {
  let address = tokenPurchase.address;
  const list = $('#token-purchase-contracts');
  const contractDetails = `<a href="#" class="apply">apply</a> <span class="address">${address}</span> | <span class="tokens">Tokens</span> | <span class="price">Wei</span> | <span class="opened">Opened </span>`;
  const tokenPurchaseElement = list.find(`#${address}`);

  tokenPurchaseElement.length ? tokenPurchaseElement.html(contractDetails) : list.append(`<p id="${address}">${contractDetails}</p>`);
  tokenPurchase.amount().then(tokens => list.find(`#${address}`).find(".tokens").html(`Tokens ${tokens}`)).catch(showError);
  tokenPurchase.priceInWei().then(price => list.find(`#${address}`).find(".price").html(`Wei ${price}`)).catch(showError);
  tokenPurchase.tokenPurchaseOpened().then(opened => list.find(`#${address}`).find(".opened").html(`Opened ${opened}`)).catch(showError);
};

// Every time we click a transaction we will look for its details into the blockchain
const updateTransactionInfo = event => {
  event.preventDefault();
  let transactionHash = $(event.target).text();
  web3.eth.getTransaction(transactionHash, function(error, transactionInfo) {
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
};

// Every time we click the buy button, we send ether to the TokenPurchase contract to buy those tokens
$('#buy').click(() => {
  let amount = $('#buying-amount').val();
  let weiAmount = $('#wei-amount').val();
  let buyerAddress = $('#buyer-address').val();

  console.log(`Buying ${amount} tokens from ${buyerAddress} by Wei ${weiAmount}`);
  TokenPurchase.new(myToken.address, amount, { from: buyerAddress, gas: GAS }).then(tokenPurchase => {
    tokenPurchase.sendTransaction({ from: buyerAddress, value: weiAmount, gas: GAS }).then(response => {
      synchAccounts();
      addTransaction(response.tx);
      updateTokenPurchaseContractStatus(tokenPurchase);
    }).catch(showError);
  }).catch(showError);
});

// Every time we click the sell button, we will deploy a new TokenPurchase contract
$('#sell').click(() => {
  let sellerAddress = $('#seller-address').val();
  let tokenPurchaseContractAddress = $('#tokenpurchase-contract-address').val();

  console.log(`Seller ${sellerAddress} applying to purchase ${tokenPurchaseContractAddress}`);
  TokenPurchase.at(tokenPurchaseContractAddress).then(tokenPurchase => {
    tokenPurchase.amount().then(amount => {
      myToken.approve(tokenPurchase.address, amount, { from: sellerAddress, gas: GAS }).then(approval => {
        addTransaction(approval.transactionHash);
        synchAccounts();
        tokenPurchase.claim({ from: seller, gas: GAS }).then(claim => {
          addTransaction(claim.tx);
          synchAccounts();
        }).catch(showError);
      }).catch(showError);
    }).catch(showError);
  }).catch(showError);
});

// Show initial accounts state and initialize callback triggers
synchAccounts();
$(document).on('click', '.deploy', e => deployMyToken(e));
$(document).on('click', '.buy', e => updateBuyingFormWithAddress(e));
$(document).on('click', '.sell', e => updateSellingFormWithAddress(e));
$(document).on('click', '.apply', e => updateSellingFormWithContract(e));
$(document).on('click', '.transaction', e => updateTransactionInfo(e));
