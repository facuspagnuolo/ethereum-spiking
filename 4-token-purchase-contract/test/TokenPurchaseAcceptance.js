const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const MyToken = artifacts.require('MyToken');
const TokenPurchase = artifacts.require('TokenPurchase');
const TokenPurchaseAcceptance = artifacts.require('TokenPurchaseAcceptance');

contract('TokenPurchaseAcceptance', accounts => {
  describe('given a tokens contract with an initial owner', async function () {
    let myToken = null;
    const owner = accounts[0];
    const myTokensInitialAmount = new BigNumber(100);

    beforeEach(async function() {
      myToken = await MyToken.new(myTokensInitialAmount, { from: owner });
    });

    describe('given a token purchase contract', async function () {
      let tokenPurchase = null;
      const buyer = accounts[1];
      const buyingPriceInWei = new BigNumber(1000);
      const buyingAmountOfTokens = new BigNumber(10);

      beforeEach(async function() {
        tokenPurchase = await TokenPurchase.new(myToken.address, buyingAmountOfTokens, {from: buyer});
        await tokenPurchase.sendTransaction({ from: buyer, value: buyingPriceInWei });
      });

      describe('given an acceptance contract', async function () {
        let acceptance = null;

        beforeEach(async function() {
          acceptance = await TokenPurchaseAcceptance.new(myToken.address, tokenPurchase.address, { from: owner });
        });

        it('is claimed and does not have tokens initially', async function () {
          const claimed = await acceptance.claimed();
          const tokens = await myToken.balanceOf(acceptance.address);

          claimed.should.be.false;
          tokens.should.be.bignumber.equal(new BigNumber(0));
        });

        describe('when someone claims those tokens', async function () {
          beforeEach(async function () {
            await myToken.sendTokens(acceptance.address, buyingAmountOfTokens, { from: owner });
          });

          describe('when the claimer is the purchase contract', async function() {
            // it('transfers those tokens', async function() {
            //   await acceptance.claim({ from: tokenPurchase.address });
            //   const claimed = await acceptance.claimed();
            //   const buyerTokens = await myToken.balanceOf(buyer);
            //   const acceptanceTokens = await myToken.balanceOf(acceptance.address);
            //
            //   claimed.should.be.true;
            //   buyerTokens.should.be.bignumber.equal(buyingAmountOfTokens);
            //   acceptanceTokens.should.be.bignumber.equal(new BigNumber(0));
            // });
          });

          describe('when the claimer is not the purchase contract', async function() {
            it('does not transfer those tokens', async function() {
              try {
                await acceptance.claim({ from: owner });
              } catch (error) {
                error.message.search('invalid opcode').should.be.above(0);
              }
              const claimed = await acceptance.claimed();
              const buyerTokens = await myToken.balanceOf(buyer);
              const acceptanceTokens = await myToken.balanceOf(acceptance.address);

              claimed.should.be.false;
              buyerTokens.should.be.bignumber.equal(new BigNumber(0));
              acceptanceTokens.should.be.bignumber.equal(buyingAmountOfTokens);
            });
          });
        });
      });
    });
  });
});
