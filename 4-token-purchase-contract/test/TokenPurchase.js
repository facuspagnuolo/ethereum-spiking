const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const MyToken = artifacts.require('MyToken');
const TokenPurchase = artifacts.require('TokenPurchase');
const TokenPurchaseAcceptance = artifacts.require('TokenPurchaseAcceptance');

contract('TokenPurchase', accounts => {
  describe('given a tokens contract with an initial owner', async function () {
    let myToken = null;
    const owner = accounts[0];
    const myTokensInitialAmount = new BigNumber(100);

    beforeEach(async function() {
      myToken = await MyToken.new(myTokensInitialAmount, { from: owner });
    });

    describe('given a token purchase contract', async function () {
      let tokenPurchase = null;
      const purchaser = accounts[1];
      const buyingAmountOfTokens = new BigNumber(10);

      beforeEach(async function() {
        tokenPurchase = await TokenPurchase.new(myToken.address, buyingAmountOfTokens, { from: purchaser });
      });

      it('is initialized with the buyer, the amount of tokens to buy, and the tokens contract', async function () {
        const buyer = await tokenPurchase.buyer();
        const amount = await tokenPurchase.amount();
        const tokenAddress = await tokenPurchase.token();

        buyer.should.be.equal(purchaser);
        tokenAddress.should.be.equal(myToken.address);
        amount.should.be.bignumber.equal(buyingAmountOfTokens);
      });

      it('is not opened and does not have ether initially', async function () {
        const priceInWei = await tokenPurchase.priceInWei();
        const tokenPurchaseOpened = await tokenPurchase.tokenPurchaseOpened();

        tokenPurchaseOpened.should.be.false;
        priceInWei.should.be.bignumber.equal(new BigNumber(0));
      });

      describe('when some ether is transferred to the purchase contract', async function() {
        let transaction = null;

        describe('when the the amount of sent ether is greater than 0', async function() {
          const buyingPriceInWei = new BigNumber(1000);

          describe('when the sender is the buyer of the purchase contract', async function() {

            it('opens the purchase contract and receives the amount of ether as the price for those tokens', async function () {
              const senderPreEtherBalance = web3.eth.getBalance(purchaser);
              const contractPreEtherBalance = web3.eth.getBalance(tokenPurchase.address);

              transaction = await tokenPurchase.sendTransaction({ from: purchaser, value: buyingPriceInWei, gasPrice: 0 });
              const priceInWei = await tokenPurchase.priceInWei();
              const tokenPurchaseOpened = await tokenPurchase.tokenPurchaseOpened();

              tokenPurchaseOpened.should.be.true;
              priceInWei.should.be.bignumber.equal(buyingPriceInWei);
              web3.eth.getBalance(purchaser).should.bignumber.be.equal(senderPreEtherBalance.minus(buyingPriceInWei));
              web3.eth.getBalance(tokenPurchase.address).should.bignumber.be.equal(contractPreEtherBalance.plus(buyingPriceInWei));
            });

            describe('when an owner creates a purchase acceptance contract', async function () {
              let acceptance = null;

              beforeEach(async function() {
                transaction = await tokenPurchase.sendTransaction({ from: purchaser, value: buyingPriceInWei });
                acceptance = await TokenPurchaseAcceptance.new(myToken.address, tokenPurchase.address, { from: owner });
              });

              describe('when the owner did not transfer the requested amount of tokens to the acceptance contract', async function () {

                describe('when the owner claims the money to the buyer', async function () {
                  it('does not transfer the money to the seller nor the tokens to the buyer', async function() {
                    const ownerPreEtherBalance = web3.eth.getBalance(owner);
                    const contractPreEtherBalance = web3.eth.getBalance(tokenPurchase.address);

                    try {
                      await tokenPurchase.claim(acceptance.address, { from: owner, gasPrice: 0 });
                    } catch(error) {
                      error.message.search('invalid opcode').should.be.above(0);
                    }

                    const claimed = await acceptance.claimed();
                    const buyerTokens = await myToken.balanceOf(purchaser);
                    const tokenPurchaseOpened = await tokenPurchase.tokenPurchaseOpened();

                    claimed.should.be.false;
                    tokenPurchaseOpened.should.be.true;
                    buyerTokens.should.be.bignumber.equal(new BigNumber(0));
                    web3.eth.getBalance(owner).should.be.bignumber.equal(ownerPreEtherBalance);
                    web3.eth.getBalance(tokenPurchase.address).should.be.bignumber.equal(contractPreEtherBalance);
                  });
                });
              });

              describe('when the owner transfers the requested amount of tokens to the acceptance contract', async function () {
                beforeEach(async function() {
                  await myToken.sendTokens(acceptance.address, buyingAmountOfTokens, { from: owner });
                });

                describe('when the owner claims the money to the buyer', async function () {
                  it('transfers the money to the seller and the tokens to the buyer', async function() {
                    const ownerPreEtherBalance = web3.eth.getBalance(owner);

                    await tokenPurchase.claim(acceptance.address, { from: purchaser });
                    const claimed = await acceptance.claimed();
                    const tokenPurchaseOpen = await tokenPurchase.tokenPurchaseOpened();
                    const buyerTokens = await myToken.balanceOf(purchaser);
                    const acceptanceTokens = await myToken.balanceOf(acceptance.address);

                    claimed.should.be.true;
                    tokenPurchaseOpen.should.be.false;
                    buyerTokens.should.be.bignumber.equal(buyingAmountOfTokens);
                    acceptanceTokens.should.be.bignumber.equal(new BigNumber(0));
                    web3.eth.getBalance(tokenPurchase.address).should.be.bignumber.equal(new BigNumber(0));
                    web3.eth.getBalance(owner).should.be.bignumber.equal(ownerPreEtherBalance.plus(buyingPriceInWei));
                  });
                });
              });
            });
          });

          describe('when the sender is not the buyer of the purchase contract', async function() {

            it('does not open the purchase contract', async function () {
              await assertItDoesNotOpenThePurchaseContract(owner, buyingPriceInWei, new BigNumber(0));
            });
          });
        });

        describe('when the the amount of sent ether is 0', async function() {
          const buyingPriceInWei = new BigNumber(0);

          it('does not open the purchase contract', async function () {
            await assertItDoesNotOpenThePurchaseContract(purchaser, buyingPriceInWei, buyingPriceInWei);
          });
        });

        async function assertItDoesNotOpenThePurchaseContract(from, value, expectedContractPrice) {
          const senderPreEtherBalance = web3.eth.getBalance(from);
          const contractPreEtherBalance = web3.eth.getBalance(tokenPurchase.address);

          try {
            transaction = await tokenPurchase.sendTransaction({ from: from, value: value, gasPrice: 0 });
          } catch (error) {
            error.message.search('invalid opcode').should.be.above(0);
          }
          const priceInWei = await tokenPurchase.priceInWei();
          const tokenPurchaseOpened = await tokenPurchase.tokenPurchaseOpened();

          tokenPurchaseOpened.should.be.false;
          priceInWei.should.be.bignumber.equal(expectedContractPrice);
          web3.eth.getBalance(from).should.bignumber.be.equal(senderPreEtherBalance);
          web3.eth.getBalance(tokenPurchase.address).should.bignumber.be.equal(contractPreEtherBalance);
        }
      });

      describe('when the buyer did not transfer ether to the purchase contract', async function() {

        describe('when an owner creates a purchase acceptance contract', async function () {
          let acceptance = null;

          beforeEach(async function() {
            acceptance = await TokenPurchaseAcceptance.new(myToken.address, tokenPurchase.address, { from: owner });
          });

          describe('when the owner claims the money to the buyer', async function () {
            it('does not transfer the money to the seller nor the tokens to the buyer', async function() {
              const ownerPreEtherBalance = web3.eth.getBalance(owner);
              const contractPreEtherBalance = web3.eth.getBalance(tokenPurchase.address);

              try {
                await tokenPurchase.claim(acceptance.address, { from: owner, gasPrice: 0 });
              } catch(error) {
                error.message.search('invalid opcode').should.be.above(0);
              }

              const claimed = await acceptance.claimed();
              const buyerTokens = await myToken.balanceOf(purchaser);
              const tokenPurchaseOpened = await tokenPurchase.tokenPurchaseOpened();

              claimed.should.be.false;
              tokenPurchaseOpened.should.be.false;
              buyerTokens.should.be.bignumber.equal(new BigNumber(0));
              web3.eth.getBalance(owner).should.be.bignumber.equal(ownerPreEtherBalance);
              web3.eth.getBalance(tokenPurchase.address).should.be.bignumber.equal(contractPreEtherBalance);
            });
          });
        });
      });
    });
  });
});
