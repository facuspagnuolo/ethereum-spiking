import ether from './helpers/ether'
const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const MyToken = artifacts.require('MyToken');
const TokenSale = artifacts.require('TokenSale');

contract('TokenSale', accounts => {
  let myToken = null;
  let tokenSale = null;
  const owner = accounts[0];
  const myTokensInitialAmount = new BigNumber(100);

  beforeEach(async function() {
    myToken = await MyToken.new(myTokensInitialAmount, { from: owner });
  });

  describe('when the selling amount of tokens is available', async function() {
    const sellingPriceInEther = 1;
    const amountOfSellingTokens = new BigNumber(10);

    beforeEach(async function() {
      tokenSale = await TokenSale.new(myToken.address, amountOfSellingTokens, sellingPriceInEther, { from: owner });
    });

    it('should be initialized with the given amount of tokens and price', async function () {
      let seller = await tokenSale.seller();
      let tokenAddress = await tokenSale.token();
      let sellingAmount = await tokenSale.amountOfTokens();
      let sellingPrice = await tokenSale.priceInEther();
      let tokenSaleClosed = await tokenSale.tokenSaleClosed();

      seller.should.be.equal(owner);
      tokenAddress.should.be.equal(myToken.address);
      sellingAmount.should.be.bignumber.equal(amountOfSellingTokens);
      sellingPrice.should.be.bignumber.equal(ether(sellingPriceInEther));
      tokenSaleClosed.should.be.false;
    });
  });

  describe('when the selling amount of tokens is not available', async function() {
    const sellingPriceInEther = 1;
    const amountOfSellingTokens = myTokensInitialAmount + 1;

    beforeEach(async function() {
      tokenSale = await TokenSale.new(myToken.address, amountOfSellingTokens, sellingPriceInEther, { from: owner });
    });

    it('should be initialized with a given amount of tokens and a price for them', async function () {
      let seller = await tokenSale.seller();
      let tokenAddress = await tokenSale.token();
      let sellingAmount = await tokenSale.amountOfTokens();
      let sellingPrice = await tokenSale.priceInEther();
      let tokenSaleClosed = await tokenSale.tokenSaleClosed();

      seller.should.be.equal(owner);
      tokenAddress.should.be.equal(myToken.address);
      sellingAmount.should.be.bignumber.equal(amountOfSellingTokens);
      sellingPrice.should.be.bignumber.equal(ether(sellingPriceInEther));
      tokenSaleClosed.should.be.false;
    });
  });
});
