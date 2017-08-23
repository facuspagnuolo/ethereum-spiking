const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const MyToken = artifacts.require('MyToken');

contract('MyToken', accounts => {
  let myToken = null;
  const owner = accounts[0];
  const initialAmountOfTokens = new BigNumber(100);

  beforeEach(async function() {
    myToken = await MyToken.new(initialAmountOfTokens, { from: owner });
  });

  it('should be initialized with given amount', async function () {
    const balance = await myToken.balanceOf(owner);
    balance.should.be.bignumber.equal(initialAmountOfTokens)
  });

  describe('when an owner send some tokens to a receiver', () => {
    const receiver = accounts[1];

    describe('when sending amount is available', () => {
      const sendingAmount = new BigNumber(10);

      it('allows the owner to send that amount of tokens', async function () {
        const result = await myToken.transfer(receiver, sendingAmount, { from: owner });

        const ownerBalance = await myToken.balanceOf(owner);
        const receiverBalance = await myToken.balanceOf(receiver);

        ownerBalance.should.be.bignumber.equal(new BigNumber(90));
        receiverBalance.should.be.bignumber.equal(new BigNumber(10));
        result.logs[0].event.should.be.equal('Transfer');
      });
    });

    describe('when sending amount greater than the available', () => {
      const sendingAmount = new BigNumber(101);

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
        error.message.search('invalid opcode').should.be.above(0);
      }

      const ownerBalance = await myToken.balanceOf(owner);
      const receiverBalance = await myToken.balanceOf(receiver);

      ownerBalance.should.be.bignumber.equal(new BigNumber(100));
      receiverBalance.should.be.bignumber.equal(new BigNumber(0));
    }
  });
});
