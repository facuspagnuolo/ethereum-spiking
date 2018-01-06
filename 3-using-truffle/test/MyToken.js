const MyToken = artifacts.require('MyToken')

contract('MyToken', accounts => {
  let myToken = null
  const owner = accounts[0]

  beforeEach(async function() {
    myToken = await MyToken.new({ from: owner })
  })

  it('has a total supply and a creator', async function () {
    const creator = await myToken.creator()
    const totalSupply = await myToken.totalSupply()

    assert(creator === owner)
    assert(totalSupply.eq(10000))
  })

  it('assigns the initial balance to the owner', async function () {
    const balance = await myToken.balanceOf(owner)

    assert(balance.eq(10000))
  })

  describe('when an owner send some tokens to a receiver', () => {
    const receiver = accounts[1]

    describe('when sending amount is available', () => {
      const sendingAmount = 10

      it('allows the owner to send that amount of tokens', async function () {
        await myToken.sendTokens(receiver, sendingAmount, { from: owner })

        const ownerBalance = await myToken.balanceOf(owner)
        const receiverBalance = await myToken.balanceOf(receiver)

        assert(ownerBalance.eq(9990))
        assert(receiverBalance.eq(10))
      })
    })

    describe('when sending amount greater than the available', () => {
      const sendingAmount = 10001

      it('does not allow the owner to send that amount and does not send anything', async function () {
        await itDoesNotSendAmount(sendingAmount)
      })
    })

    describe('when sending a negative amount', () => {
      const sendingAmount = -100

      it('does not allow the owner to send that amount and does not send anything', async function () {
        await itDoesNotSendAmount(sendingAmount)
      })
    })

    async function itDoesNotSendAmount(sendingAmount) {
      try {
        await myToken.sendTokens(receiver, sendingAmount, {from: owner})
      } catch (error) {
        assert(error.message.search('revert') > 0)
      }

      const ownerBalance = await myToken.balanceOf(owner)
      const receiverBalance = await myToken.balanceOf(receiver)

      assert(ownerBalance.eq(10000))
      assert(receiverBalance.eq(0))
    }
  })
})
