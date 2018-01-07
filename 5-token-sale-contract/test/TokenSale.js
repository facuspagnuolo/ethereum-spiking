const MyToken = artifacts.require('MyToken')
const TokenSale = artifacts.require('TokenSale')

contract('TokenSale', accounts => {
  describe('given a tokens contract with an initial owner', async function () {
    let myToken = null
    const owner = accounts[0]

    beforeEach(async function() {
      myToken = await MyToken.new({ from: owner })
    })

    describe('given a token sale contract', async function () {
      let tokenSale = null
      const sellingPriceInWei = 100000

      beforeEach(async function() {
        tokenSale = await TokenSale.new(myToken.address, sellingPriceInWei, { from: owner })
      })

      it('is initialized with a price, the seller, the tokens contract but no tokens for sale', async function () {
        const seller = await tokenSale.owner()
        const amount = await tokenSale.amount()
        const tokenAddress = await tokenSale.token()
        const sellingPrice = await tokenSale.priceInWei()
        const tokenSaleClosed = await tokenSale.tokenSaleClosed()

        assert(seller === owner)
        assert(amount.eq(0))
        assert(tokenAddress === myToken.address)
        assert(sellingPrice.eq(sellingPriceInWei))
        assert(!tokenSaleClosed)
      })

      describe('when the owner transfer some tokens to the sale contract', async function() {
        const amountOfTokens = 10

        beforeEach(async function() {
          await myToken.transfer(tokenSale.address, amountOfTokens, { from: owner })
        })

        it('has some tokens for sale', async function () {
          const amount = await tokenSale.amount()
          const ownerTokens = await myToken.balanceOf(owner)
          const contractTokens = await myToken.balanceOf(tokenSale.address)

          assert(amount.eq(amountOfTokens))
          assert(ownerTokens.eq(9990))
          assert(contractTokens.eq(amountOfTokens))
        })

        describe('when a buyer sends ether to the token sale contract', async function() {
          const buyer = accounts[1]
          let transaction = null

          describe('when the amount of ether is equal than the selling price', async function() {
            const weiSendingAmount = sellingPriceInWei

            it('transfers the tokens to the buyer', async function () {
              transaction = await tokenSale.sendTransaction({ from: buyer, value: weiSendingAmount })
              const buyerTokens = await myToken.balanceOf(buyer)
              const ownerTokens = await myToken.balanceOf(owner)
              const contractTokens = await myToken.balanceOf(tokenSale.address)

              assert(contractTokens.eq(0))
              assert(ownerTokens.eq(9990))
              assert(buyerTokens.eq(10))
            })

            it('transfers the ether to the seller', async function () {
              const ownerPreEtherBalance = web3.eth.getBalance(owner)
              const buyerPreEtherBalance = web3.eth.getBalance(buyer)

              transaction = await tokenSale.sendTransaction({ from: buyer, value: weiSendingAmount, gasPrice: 0 })

              assert(web3.eth.getBalance(owner).eq(ownerPreEtherBalance.plus(weiSendingAmount)))
              assert(web3.eth.getBalance(buyer).eq(buyerPreEtherBalance.minus(weiSendingAmount)))
            })

            it('changes the state of the token sale contract', async function() {
              await tokenSale.sendTransaction({ from: buyer, value: weiSendingAmount })

              const seller = await tokenSale.owner()
              const amount = await tokenSale.amount()
              const tokenAddress = await tokenSale.token()
              const sellingPrice = await tokenSale.priceInWei()
              const tokenSaleClosed = await tokenSale.tokenSaleClosed()

              assert(seller === owner)
              assert(amount.eq(0))
              assert(tokenAddress === myToken.address)
              assert(sellingPrice.eq(sellingPriceInWei))
              assert(tokenSaleClosed)
            })

            it('triggers a purchase event', async function () {
              transaction = await tokenSale.sendTransaction({ from: buyer, value: weiSendingAmount })

              assert(transaction.logs[0].event === 'TokenPurchase')
            })
          })

          describe('when the amount of ether is less than the selling price', async function() {
            const weiSendingAmount = sellingPriceInWei - 1

            it('does not transfer those tokens nor ether', async function () {
              await assertItDoesNotTransferTokensNorEtherAndDoesNotChangeContractState(buyer, amountOfTokens, weiSendingAmount)
            })
          })

          describe('when the amount of ether is greater than the selling price', async function() {
            const weiSendingAmount = sellingPriceInWei + 1

            it('does not transfer those tokens nor ether', async function () {
              await assertItDoesNotTransferTokensNorEtherAndDoesNotChangeContractState(buyer, amountOfTokens, weiSendingAmount)
            })
          })
        })
      })

      describe('when the owner did not transfer any tokens to the sale contract', async function() {
        const amountOfTokens = 0

        describe('when a buyer sends ether to the token sale contract', async function() {
          const buyer = accounts[1]

          describe('when the amount of ether is equal than the selling price', async function() {
            const weiSendingAmount = sellingPriceInWei

            it('does not transfer those tokens nor ether', async function () {
              await assertItDoesNotTransferTokensNorEtherAndDoesNotChangeContractState(buyer, amountOfTokens, weiSendingAmount)
            })
          })

          describe('when the amount of ether is less than the selling price', async function() {
            const weiSendingAmount = sellingPriceInWei - 1

            it('does not transfer those tokens nor ether', async function () {
              await assertItDoesNotTransferTokensNorEtherAndDoesNotChangeContractState(buyer, amountOfTokens, weiSendingAmount)
            })
          })

          describe('when the amount of ether is greater than the selling price', async function() {
            const weiSendingAmount = sellingPriceInWei + 1

            it('does not transfer those tokens nor ether', async function () {
              await assertItDoesNotTransferTokensNorEtherAndDoesNotChangeContractState(buyer, amountOfTokens, weiSendingAmount)
            })
          })
        })
      })

      async function assertItDoesNotTransferTokensNorEtherAndDoesNotChangeContractState(buyer, sellingAmountOfTokens, weiSendingAmount) {
        const totalSupply = await myToken.totalSupply()
        const ownerPreEtherBalance = web3.eth.getBalance(owner)
        const buyerPreEtherBalance = web3.eth.getBalance(buyer)

        try {
          await tokenSale.sendTransaction({ from: buyer, value: weiSendingAmount, gasPrice: 0 })
        } catch(error) {
          assert(error.message.search('revert') > 0)
        }

        const seller = await tokenSale.owner()
        const amount = await tokenSale.amount()
        const tokenAddress = await tokenSale.token()
        const sellingPrice = await tokenSale.priceInWei()
        const tokenSaleClosed = await tokenSale.tokenSaleClosed()
        const buyerTokens = await myToken.balanceOf(buyer)
        const ownerTokens = await myToken.balanceOf(owner)
        const contractTokens = await myToken.balanceOf(tokenSale.address)

        assert(seller === owner)
        assert(amount.eq(sellingAmountOfTokens))
        assert(tokenAddress === myToken.address)
        assert(sellingPrice.eq(sellingPriceInWei))
        assert(!tokenSaleClosed)

        assert(buyerTokens.eq(0))
        assert(contractTokens.eq(sellingAmountOfTokens))
        assert(ownerTokens.eq(totalSupply.minus(sellingAmountOfTokens)))

        assert(web3.eth.getBalance(owner).eq(ownerPreEtherBalance))
        assert(web3.eth.getBalance(buyer).eq(buyerPreEtherBalance))
      }
    })
  })
})
