const MyToken = artifacts.require('MyToken')
const TokenPurchase = artifacts.require('TokenPurchase')

contract('TokenPurchase', accounts => {
  describe('given a tokens contract with an initial owner', async function () {
    let myToken = null
    const owner = accounts[0]
    const myTokensInitialAmount = 100

    beforeEach(async function() {
      myToken = await MyToken.new(myTokensInitialAmount, { from: owner })
    })

    describe('given a token purchase contract', async function () {
      let tokenPurchase = null
      const purchaser = accounts[1]
      const buyingAmountOfTokens = 10

      beforeEach(async function() {
        tokenPurchase = await TokenPurchase.new(myToken.address, buyingAmountOfTokens, { from: purchaser })
      })

      it('is initialized with the buyer, the amount of tokens to buy, and the tokens contract', async function () {
        const buyer = await tokenPurchase.owner()
        const amount = await tokenPurchase.amount()
        const tokenAddress = await tokenPurchase.token()

        assert(buyer === purchaser)
        assert(tokenAddress === myToken.address)
        assert(amount.eq(buyingAmountOfTokens))
      })

      it('is not opened and does not have ether initially', async function () {
        const priceInWei = await tokenPurchase.priceInWei()
        const opened = await tokenPurchase.opened()

        assert(!opened)
        assert(priceInWei.eq(0))
      })

      describe('when some ether is transferred to the purchase contract', async function() {
        let transaction = null

        describe('when the the amount of sent ether is greater than 0', async function() {
          const buyingPriceInWei = 1000

          describe('when the sender is the buyer of the purchase contract', async function() {

            it('opens the purchase contract and receives the amount of ether as the price for those tokens', async function () {
              const senderPreEtherBalance = web3.eth.getBalance(purchaser)
              const contractPreEtherBalance = web3.eth.getBalance(tokenPurchase.address)

              transaction = await tokenPurchase.sendTransaction({ from: purchaser, value: buyingPriceInWei, gasPrice: 0 })
              const priceInWei = await tokenPurchase.priceInWei()
              const opened = await tokenPurchase.opened()

              assert(opened)
              assert(priceInWei.eq(buyingPriceInWei))
              assert(web3.eth.getBalance(purchaser).eq(senderPreEtherBalance.minus(buyingPriceInWei)))
              assert(web3.eth.getBalance(tokenPurchase.address).eq(contractPreEtherBalance.plus(buyingPriceInWei)))
            })

            describe('when an owner approves some tokens to the purchase contract', async function () {
              beforeEach(async function() {
                transaction = await tokenPurchase.sendTransaction({ from: purchaser, value: buyingPriceInWei })
              })

              describe('when an owner approved less than the requested amount of tokens to the purchase contract', async function () {
                beforeEach(async function() {
                  await myToken.approve(tokenPurchase.address, buyingAmountOfTokens - 1, { from: owner })
                })

                it('does not transfer the money to the seller nor the tokens to the buyer', async function() {
                  const ownerPreEtherBalance = web3.eth.getBalance(owner)
                  const contractPreEtherBalance = web3.eth.getBalance(tokenPurchase.address)

                  try {
                    await tokenPurchase.claim({ from: owner, gasPrice: 0 })
                  } catch(error) {
                    assert(error.message.search('revert') > 0)
                  }

                  const buyerTokens = await myToken.balanceOf(purchaser)
                  const opened = await tokenPurchase.opened()

                  assert(opened)
                  assert(buyerTokens.eq(0))
                  assert(web3.eth.getBalance(owner).eq(ownerPreEtherBalance))
                  assert(web3.eth.getBalance(tokenPurchase.address).eq(contractPreEtherBalance))
                })
              })

              describe('when the owner approved the requested amount of tokens to the purchase contract', async function () {
                beforeEach(async function() {
                  await myToken.approve(tokenPurchase.address, buyingAmountOfTokens, { from: owner })
                })

                it('transfers the money to the seller and the tokens to the buyer', async function() {
                  const ownerPreEtherBalance = web3.eth.getBalance(owner)

                  await tokenPurchase.claim({ from: owner, gasPrice: 0 })
                  const opened = await tokenPurchase.opened()
                  const buyerTokens = await myToken.balanceOf(purchaser)

                  assert(!opened)
                  assert(buyerTokens.eq(buyingAmountOfTokens))
                  assert(web3.eth.getBalance(tokenPurchase.address).eq(0))
                  assert(web3.eth.getBalance(owner).eq(ownerPreEtherBalance.plus(buyingPriceInWei)))
                })
              })

              describe('when the owner approved more than the requested amount of tokens to the purchase contract', async function () {
                beforeEach(async function() {
                  await myToken.approve(tokenPurchase.address, buyingAmountOfTokens + 1, { from: owner })
                })

                it('transfers the money to the seller and the tokens to the buyer', async function() {
                  const ownerPreEtherBalance = web3.eth.getBalance(owner)

                  await tokenPurchase.claim({ from: owner, gasPrice: 0 })
                  const opened = await tokenPurchase.opened()
                  const buyerTokens = await myToken.balanceOf(purchaser)

                  assert(!opened)
                  assert(buyerTokens.eq(buyingAmountOfTokens))
                  assert(web3.eth.getBalance(tokenPurchase.address).eq(0))
                  assert(web3.eth.getBalance(owner).eq(ownerPreEtherBalance.plus(buyingPriceInWei)))
                })
              })
            })
          })

          describe('when the sender is not the buyer of the purchase contract', async function() {

            it('does not open the purchase contract', async function () {
              await assertItDoesNotOpenThePurchaseContract(owner, buyingPriceInWei, 0)
            })
          })
        })

        describe('when the the amount of sent ether is 0', async function() {
          const buyingPriceInWei = 0

          it('does not open the purchase contract', async function () {
            await assertItDoesNotOpenThePurchaseContract(purchaser, buyingPriceInWei, buyingPriceInWei)
          })
        })

        async function assertItDoesNotOpenThePurchaseContract(from, value, expectedContractPrice) {
          const senderPreEtherBalance = web3.eth.getBalance(from)
          const contractPreEtherBalance = web3.eth.getBalance(tokenPurchase.address)

          try {
            transaction = await tokenPurchase.sendTransaction({ from: from, value: value, gasPrice: 0 })
          } catch (error) {
            assert(error.message.search('revert') > 0)
          }
          const priceInWei = await tokenPurchase.priceInWei()
          const opened = await tokenPurchase.opened()

          assert(!opened)
          assert(priceInWei.eq(expectedContractPrice))
          assert(web3.eth.getBalance(from).eq(senderPreEtherBalance))
          assert(web3.eth.getBalance(tokenPurchase.address).eq(contractPreEtherBalance))
        }
      })

      describe('when no ether was transferred to the purchase contract', async function() {

        describe('when an owner approves some tokens to the buyer', async function () {

          describe('when an owner approved less than the requested amount of tokens to the purchase contract', async function () {
            beforeEach(async function() {
              await myToken.approve(tokenPurchase.address, buyingAmountOfTokens - 1, { from: owner })
            })

            it('does not transfer the money to the seller nor the tokens to the buyer', async function() {
              await itDoesNotTransferTheTokens()
            })
          })

          describe('when the owner approved the requested amount of tokens to the purchase contract', async function () {
            beforeEach(async function() {
              await myToken.approve(tokenPurchase.address, buyingAmountOfTokens, { from: owner })
            })

            it('does not transfer the money to the seller nor the tokens to the buyer', async function() {
              await itDoesNotTransferTheTokens()
            })
          })

          describe('when the owner approved more than the requested amount of tokens to the purchase contract', async function () {
            beforeEach(async function() {
              await myToken.approve(tokenPurchase.address, buyingAmountOfTokens + 1, { from: owner })
            })

            it('does not transfer the money to the seller nor the tokens to the buyer', async function() {
              await itDoesNotTransferTheTokens()
            })
          })

          async function itDoesNotTransferTheTokens() {
            const ownerPreEtherBalance = web3.eth.getBalance(owner)
            const contractPreEtherBalance = web3.eth.getBalance(tokenPurchase.address)

            try {
              await tokenPurchase.claim({ from: owner, gasPrice: 0 })
            } catch (error) {
              assert(error.message.search('revert') > 0)
            }

            const buyerTokens = await myToken.balanceOf(purchaser)
            const opened = await tokenPurchase.opened()

            assert(!opened)
            assert(buyerTokens.eq(0))
            assert(web3.eth.getBalance(owner).eq(ownerPreEtherBalance))
            assert(web3.eth.getBalance(tokenPurchase.address).eq(contractPreEtherBalance))
          }
        })
      })
    })
  })
})
