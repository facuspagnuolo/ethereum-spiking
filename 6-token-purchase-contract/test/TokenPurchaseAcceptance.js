const MyToken = artifacts.require('MyToken')
const TokenPurchase = artifacts.require('TokenPurchase')
const TokenPurchaseAcceptance = artifacts.require('TokenPurchaseAcceptance')

contract('TokenPurchaseAcceptance', accounts => {
  describe('given a tokens contract with an initial owner', async function () {
    let myToken = null
    const owner = accounts[0]

    beforeEach(async function() {
      myToken = await MyToken.new({ from: owner })
    })

    describe('given a token purchase contract', async function () {
      let tokenPurchase = null
      const buyer = accounts[1]
      const buyingPriceInWei = 1000
      const buyingAmountOfTokens = 10

      beforeEach(async function() {
        tokenPurchase = await TokenPurchase.new(myToken.address, buyingAmountOfTokens, {from: buyer})
        await tokenPurchase.sendTransaction({ from: buyer, value: buyingPriceInWei })
      })

      describe('given an acceptance contract', async function () {
        let acceptance = null

        beforeEach(async function() {
          acceptance = await TokenPurchaseAcceptance.new(myToken.address, tokenPurchase.address, { from: owner })
        })

        it('is claimed and does not have tokens initially', async function () {
          const claimed = await acceptance.claimed()
          const tokens = await myToken.balanceOf(acceptance.address)

          assert(!claimed)
          assert(tokens.eq(0))
        })

        describe('when someone claims those tokens', async function () {
          beforeEach(async function () {
            await myToken.sendTokens(acceptance.address, buyingAmountOfTokens, { from: owner })
          })

          describe('when the claimer is the purchase contract', async function() {
            xit('transfers those tokens', async function() {
              await acceptance.claim({ from: tokenPurchase.address })
              const claimed = await acceptance.claimed()
              const buyerTokens = await myToken.balanceOf(buyer)
              const acceptanceTokens = await myToken.balanceOf(acceptance.address)

              assert(claimed)
              assert(buyerTokens.eq(buyingAmountOfTokens))
              assert(acceptanceTokens.eq(0))
            })
          })

          describe('when the claimer is not the purchase contract', async function() {
            it('does not transfer those tokens', async function() {
              try {
                await acceptance.claim({ from: owner })
              } catch (error) {
                assert(error.message.search('revert') > 0)
              }
              const claimed = await acceptance.claimed()
              const buyerTokens = await myToken.balanceOf(buyer)
              const acceptanceTokens = await myToken.balanceOf(acceptance.address)

              assert(!claimed)
              assert(buyerTokens.eq(0))
              assert(acceptanceTokens.eq(buyingAmountOfTokens))
            })
          })
        })
      })
    })
  })
})
