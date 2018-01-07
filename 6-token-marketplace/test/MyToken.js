const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const MyToken = artifacts.require('MyToken');

contract('MyToken', accounts => {
  let myToken = null;
  const owner = accounts[0];

  beforeEach(async function() {
    myToken = await MyToken.new({ from: owner });
  });

  it('has an initial supply, a amount of decimals, a symbol and a name', async function () {
    const name = await myToken.name();
    const symbol = await myToken.symbol();
    const balance = await myToken.balanceOf(owner);

    name.should.be.equal('MyToken')
    symbol.should.be.equal('MTK')
    balance.should.be.bignumber.equal(new BigNumber(10000))
  });

  describe('when an owner send some tokens to a receiver', () => {
    const receiver = accounts[1];

    describe('when sending amount is available', () => {
      const sendingAmount = new BigNumber(10);

      it('allows the owner to send that amount of tokens', async function () {
        const result = await myToken.transfer(receiver, sendingAmount, { from: owner });

        const ownerBalance = await myToken.balanceOf(owner);
        const receiverBalance = await myToken.balanceOf(receiver);

        ownerBalance.should.be.bignumber.equal(new BigNumber(9990));
        receiverBalance.should.be.bignumber.equal(new BigNumber(10));
        result.logs[0].event.should.be.equal('Transfer');
      });
    });

    describe('when sending amount greater than the available', () => {
      const sendingAmount = new BigNumber(10001);

      it('does not allow the owner to send that amount and does not send anything', async function () {
        await itDoesNotSendAmount(sendingAmount);
      });
    });

    describe('when sending a negative amount', () => {
      const sendingAmount = new BigNumber(-100);

      it('does not allow the owner to send that amount and does not send anything', async function () {
        await itDoesNotSendAmount(sendingAmount);
      });
    });

    async function itDoesNotSendAmount(sendingAmount) {
      try {
        await myToken.transfer(receiver, sendingAmount, {from: owner});
      } catch (error) {
        error.message.search('revert').should.be.above(0);
      }

      const ownerBalance = await myToken.balanceOf(owner);
      const receiverBalance = await myToken.balanceOf(receiver);

      ownerBalance.should.be.bignumber.equal(new BigNumber(10000));
      receiverBalance.should.be.bignumber.equal(new BigNumber(0));
    }
  });
});
