const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const MyToken = artifacts.require('MyToken');
const TokenSale = artifacts.require('TokenSale');

contract('TokenSale', accounts => {
  describe('given a tokens contract with an initial owner', async function () {
    let myToken = null;
    const owner = accounts[0];
    const myTokensInitialAmount = new BigNumber(100);

    beforeEach(async function() {
      myToken = await MyToken.new(myTokensInitialAmount, { from: owner });
    });

    describe('given a token sale contract', async function () {
      let tokenSale = null;
      const sellingPriceInWei = 100000;

      beforeEach(async function() {
        tokenSale = await TokenSale.new(myToken.address, sellingPriceInWei, { from: owner });
      });

      it('is initialized with a price, the seller, the tokens contract but no tokens for sale', async function () {
        const seller = await tokenSale.owner();
        const amount = await tokenSale.amount();
        const tokenAddress = await tokenSale.token();
        const sellingPrice = await tokenSale.priceInWei();
        const closed = await tokenSale.closed();

        seller.should.be.equal(owner);
        amount.should.be.bignumber.equal(0);
        tokenAddress.should.be.equal(myToken.address);
        sellingPrice.should.be.bignumber.equal(sellingPriceInWei);
        closed.should.be.false;
      });

      describe('when the owner transfer some tokens to the sale contract', async function() {
        const amountOfTokens = new BigNumber(10);

        beforeEach(async function() {
          await myToken.transfer(tokenSale.address, amountOfTokens, { from: owner });
        });

        it('has some tokens for sale', async function () {
          const amount = await tokenSale.amount();
          const ownerTokens = await myToken.balanceOf(owner);
          const contractTokens = await myToken.balanceOf(tokenSale.address);

          amount.should.be.bignumber.equal(amountOfTokens);
          ownerTokens.should.be.bignumber.equal(new BigNumber(90));
          contractTokens.should.be.bignumber.equal(amountOfTokens);
        });

        describe('when a buyer sends ether to the token sale contract', async function() {
          const buyer = accounts[1];
          let transaction = null;

          describe('when the amount of ether is equal than the selling price', async function() {
            const weiSendingAmount = sellingPriceInWei;

            it('transfers the tokens to the buyer', async function () {
              transaction = await tokenSale.sendTransaction({ from: buyer, value: weiSendingAmount });
              const buyerTokens = await myToken.balanceOf(buyer);
              const ownerTokens = await myToken.balanceOf(owner);
              const contractTokens = await myToken.balanceOf(tokenSale.address);

              contractTokens.should.be.bignumber.equal(0);
              ownerTokens.should.be.bignumber.equal(new BigNumber(90));
              buyerTokens.should.be.bignumber.equal(new BigNumber(10));
            });

            it('transfers the ether to the seller', async function () {
              const ownerPreEtherBalance = web3.eth.getBalance(owner);
              const buyerPreEtherBalance = web3.eth.getBalance(buyer);

              transaction = await tokenSale.sendTransaction({ from: buyer, value: weiSendingAmount });

              web3.eth.getBalance(owner).should.bignumber.be.equal(ownerPreEtherBalance.plus(weiSendingAmount));
              web3.eth.getBalance(buyer).should.bignumber.be.lessThan(buyerPreEtherBalance.minus(weiSendingAmount));
              // TODO: should be equal? gas?
            });

            it('changes the state of the token sale contract', async function() {
              await tokenSale.sendTransaction({ from: buyer, value: weiSendingAmount });

              const seller = await tokenSale.owner();
              const amount = await tokenSale.amount();
              const tokenAddress = await tokenSale.token();
              const sellingPrice = await tokenSale.priceInWei();
              const closed = await tokenSale.closed();

              seller.should.be.equal(owner);
              amount.should.be.bignumber.equal(0);
              tokenAddress.should.be.equal(myToken.address);
              sellingPrice.should.be.bignumber.equal(sellingPriceInWei);
              closed.should.be.true;
            });

            it('triggers a purchase event', async function () {
              transaction = await tokenSale.sendTransaction({ from: buyer, value: weiSendingAmount });

              transaction.logs[0].event.should.be.equal('TokenPurchase');
            });
          });

          describe('when the amount of ether is less than the selling price', async function() {
            const weiSendingAmount = sellingPriceInWei - 1;

            it('does not transfer those tokens nor ether', async function () {
              await assertItDoesNotTransferTokensNorEtherAndDoesNotChangeContractState(transaction, buyer, amountOfTokens, weiSendingAmount);
            });
          });

          describe('when the amount of ether is greater than the selling price', async function() {
            const weiSendingAmount = sellingPriceInWei + 1;

            it('does not transfer those tokens nor ether', async function () {
              await assertItDoesNotTransferTokensNorEtherAndDoesNotChangeContractState(transaction, buyer, amountOfTokens, weiSendingAmount);
            });
          });
        });
      });

      describe('when the owner did not transfer any tokens to the sale contract', async function() {
        const amountOfTokens = new BigNumber(0);

        describe('when a buyer sends ether to the token sale contract', async function() {
          const buyer = accounts[1];
          let transaction = null;

          describe('when the amount of ether is equal than the selling price', async function() {
            const weiSendingAmount = sellingPriceInWei;

            it('does not transfer those tokens nor ether', async function () {
              await assertItDoesNotTransferTokensNorEtherAndDoesNotChangeContractState(transaction, buyer, amountOfTokens, weiSendingAmount);
            });
          });

          describe('when the amount of ether is less than the selling price', async function() {
            const weiSendingAmount = sellingPriceInWei - 1;

            it('does not transfer those tokens nor ether', async function () {
              await assertItDoesNotTransferTokensNorEtherAndDoesNotChangeContractState(weiSendingAmount, buyer, amountOfTokens, weiSendingAmount);
            });
          });

          describe('when the amount of ether is greater than the selling price', async function() {
            const weiSendingAmount = sellingPriceInWei + 1;

            it('does not transfer those tokens nor ether', async function () {
              await assertItDoesNotTransferTokensNorEtherAndDoesNotChangeContractState(weiSendingAmount, buyer, amountOfTokens, weiSendingAmount);
            });
          });
        });
      });

      async function assertItDoesNotTransferTokensNorEtherAndDoesNotChangeContractState(transaction, buyer, sellingAmountOfTokens, weiSendingAmount) {
        const ownerPreEtherBalance = web3.eth.getBalance(owner);
        const buyerPreEtherBalance = web3.eth.getBalance(buyer);

        try {
          await tokenSale.sendTransaction({from: buyer, value: weiSendingAmount});
        } catch(error) {
          error.message.search('invalid opcode').should.be.above(0);
        }

        const seller = await tokenSale.owner();
        const amount = await tokenSale.amount();
        const tokenAddress = await tokenSale.token();
        const sellingPrice = await tokenSale.priceInWei();
        const closed = await tokenSale.closed();
        const buyerTokens = await myToken.balanceOf(buyer);
        const ownerTokens = await myToken.balanceOf(owner);
        const contractTokens = await myToken.balanceOf(tokenSale.address);

        seller.should.be.equal(owner);
        amount.should.be.bignumber.equal(sellingAmountOfTokens);
        tokenAddress.should.be.equal(myToken.address);
        sellingPrice.should.be.bignumber.equal(sellingPriceInWei);
        closed.should.be.false;

        buyerTokens.should.be.bignumber.equal(new BigNumber(0));
        contractTokens.should.be.bignumber.equal(sellingAmountOfTokens);
        ownerTokens.should.be.bignumber.equal(myTokensInitialAmount.minus(sellingAmountOfTokens));

        web3.eth.getBalance(owner).should.bignumber.be.equal(ownerPreEtherBalance);
        web3.eth.getBalance(buyer).should.bignumber.be.lessThan(buyerPreEtherBalance);
      }
    });
  });
});
