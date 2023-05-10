const { ethers } = require ('hardhat');
//pulling ethers from hardhat library
const { expect } = require ('chai');

const tokens = (n) => {
	return ethers.utils.parseUnits(n.toString(), 'ether')
} 

describe ('Exchange', () => {

	let deployer,
		feeAccount,
		exchange,
		token1,
		user1,
		token2,
		user2

	const feePercent = 10

	beforeEach(async () => {
		accounts = await ethers.getSigners()
		deployer = accounts[0]
		feeAccount = accounts[1]
		user1 = accounts[2]
		user2 = accounts[3]

		const Exchange = await ethers.getContractFactory
			('Exchange')
		const Token = await ethers.getContractFactory
			('Token')
		exchange = await Exchange.deploy
			(feeAccount.address, feePercent)
		token1 = await Token.deploy
			('Efris Coin', 'EFRIS', '1000000')

		token2 = await Token.deploy
			('Karen Coin', 'KAREN', '1000000')

		let transaction = await token1.connect(deployer)
			.transfer(user1.address, tokens(100))
		await transaction.wait()
	}) 

	describe('Deployment', () => {

		it('tracks the fee account', async () => {
		expect(await exchange.feeAccount()).to.equal
			(feeAccount.address)
		})
		
		it('tracks the fee percent', async () => {
		expect(await exchange.feePercent()).to.equal
			(feePercent)
		})
	})

	describe('Depositing tokens', () => {
		let transaction, result
		let amount = tokens(10)

		describe('Success', () => {
			beforeEach(async () => {
				//Approve token
				transaction = await token1.connect(user1)
					.approve(exchange.address, amount)
				result = await transaction.wait()

				//deposit token
				transaction = await exchange.connect(user1)
					.depositToken(token1.address, amount)
				result = await transaction.wait()
			}) 

			it('tracks the token deposit', async () => {
				expect(await token1.balanceOf(exchange.address))
					.to.equal(amount)
				expect(await exchange.tokens(token1.address,
					user1.address)).to.equal(amount)
				expect(await exchange.balanceOf(token1.address,
					user1.address)).to.equal(amount)
			})

			it('emits a deposit event', async () => {
				const event = result.events[1]//more than one event
				expect(event.event).to.equal('Deposit')

				const args = event.args
				expect(args.token).to.equal(token1.address)
				expect(args.user).to.equal(user1.address)
				expect(args.amount).to.equal(amount)
				expect(args.balance).to.equal(amount)

			})
		})

		describe('Failure', () => {
			it('fails when no tokens are approved', async () => {
				await expect(exchange.connect(user1)
					.depositToken(token1.address, amount))
					.to.be.reverted
			})
		})
	})


describe('Withdrawing tokens', () => {
		let transaction, result
		let amount = tokens(10)

		describe('Success', () => {
			beforeEach(async () => {
				//deposit tokens before withdrawing
				//Approve token
				transaction = await token1.connect(user1)
					.approve(exchange.address, amount)
				result = await transaction.wait()

				//deposit token
				transaction = await exchange.connect(user1)
					.depositToken(token1.address, amount)
				result = await transaction.wait()

				//withdrawing
				transaction = await exchange.connect(user1)
					.withdrawToken(token1.address, amount)
				result = await transaction.wait()

			}) 

			it('tracks the token withdrawal', async () => {
				expect(await token1.balanceOf(exchange.address))
					.to.equal(0)
				 expect(await exchange.tokens(token1.address,
				 	user1.address)).to.equal(0)
				expect(await exchange.balanceOf(token1.address,
					user1.address)).to.equal(0)
			})

			it('emits a withdrawal event', async () => {
				const event = result.events[1]//more than one event
				expect(event.event).to.equal('Withdrawal')

				const args = event.args
				expect(args.token).to.equal(token1.address)
				expect(args.user).to.equal(user1.address)
				expect(args.amount).to.equal(amount)
				expect(args.balance).to.equal(0)

			})
		})

		describe('Failure', () => {
			//withdraw without depositing tokens to exchange
			it('fails when there is insufficient balance', async () => {
				await expect(exchange.connect(user1)
					.withdrawToken(token1.address, amount))
					.to.be.reverted
			})
		})
	})

	describe('Checking balances', () => {
		let transaction, result
		let amount = tokens(1)

		beforeEach(async () => {
			//Approve token
			transaction = await token1.connect(user1)
				.approve(exchange.address, amount)
			result = await transaction.wait()

			//deposit token
			transaction = await exchange.connect(user1)
				.depositToken(token1.address, amount)
			result = await transaction.wait()
		}) 

		it('returns user balance', async () => {
			expect(await exchange.balanceOf(token1.address,
				user1.address)).to.equal(amount)
		})
	})

describe('Making orders', () => {
		let transaction, result
		let amount = tokens(1)

		describe('Success', () => {
			beforeEach(async () => {
				//deposit tokens before creating order
				//Approve token
				transaction = await token1.connect(user1)
					.approve(exchange.address, amount)
				result = await transaction.wait()

				//deposit token
				transaction = await exchange.connect(user1)
					.depositToken(token1.address, amount)
				result = await transaction.wait()

				//make order
				transaction = await exchange.connect(user1)
					.makeOrder(token2.address,
						amount,
						token1.address,
						amount)
				result = await transaction.wait()
			}) 

			it('tracks the order created', async () => {
				expect(await exchange.orderCount()).to.equal(1)
			})

			it('emits an order event', async () => {
				const event = result.events[0]
				expect(event.event).to.equal('Order')

				const args = event.args
				expect(args.id).to.equal(1)
				expect(args.user).to.equal(user1.address)
				expect(args.tokenGet).to.equal(token2.address)
				expect(args.amountGet).to.equal(amount)
				expect(args.tokenGive).to.equal(token1.address)
				expect(args.amountGive).to.equal(amount)
				expect(args.timestamp).to.at.least(1)
			})

		})

		describe('Failure', () => {
			//withdraw without depositing tokens to exchange
			it('fails when there is insufficient balance',
				async () => {
					await expect(exchange.connect(user1)
						.makeOrder(token2.address, amount,
							token1.address, amount))
						.to.be.reverted
			})
		})
	})

	describe('Order actions', () => {
		let transaction, result
		let amount = tokens(1)

		beforeEach(async () => {
			//deposit tokens before creating order
			//Approve token user 1
			transaction = await token1.connect(user1)
				.approve(exchange.address, amount)
			result = await transaction.wait()

			//deposit token user1
			transaction = await exchange.connect(user1)
				.depositToken(token1.address, amount)
			result = await transaction.wait()

			//give tokens to user2
			transaction = await token2.connect(deployer)
				.transfer(user2.address, tokens(100))
			result = await transaction.wait()

			transaction = await token2.connect(user2)
				.approve(exchange.address, tokens(2))
			result = await transaction.wait()

			transaction = await exchange.connect(user2)
				.depositToken(token2.address, tokens(2))
			result = await transaction.wait()

			//make order
			transaction = await exchange.connect(user1)
				.makeOrder(token2.address,
					amount,
					token1.address,
					amount)
			result = await transaction.wait()
		})


		describe('Cancelling orders', () => {

			describe('Success', () => {
				beforeEach(async () => {
				transaction = await exchange.connect(user1)
					.cancelOrder(1)
				result = await transaction.wait()
				})

				it('updates cancelled orders', async () => {
					expect(await exchange.orderCancelled(1))
						.to.equal(true)
				})

				it('emits a cancel event', async () => {
					const event = result.events[0]
					expect(event.event).to.equal('Cancel')

					const args = event.args
					expect(args.id).to.equal(1)
					expect(args.user).to.equal(user1.address)
					expect(args.tokenGet).to.equal(token2.address)
					expect(args.amountGet).to.equal(amount)
					expect(args.tokenGive).to.equal(token1.address)
					expect(args.amountGive).to.equal(amount)
					expect(args.timestamp).to.at.least(1)
				})

			})

			describe('Failure', async () => {
				beforeEach(async () => {
					//aprove
					transaction = await token1.connect(user1)
						.approve(exchange.address, amount)
					result = await transaction.wait()

					//deposit token
					transaction = await exchange.connect(user1)
						.depositToken(token1.address, amount)
					result = await transaction.wait()

					//make order
					transaction = await exchange.connect(user1)
						.makeOrder(token2.address,
							amount,
							token1.address,
							amount)
					result = await transaction.wait()			
				})

				it('rejects invalid orders',
				async () => {
					const invalidOrderId = 99999
					await expect(exchange.connect(user1)
						.cancelOrder(invalidOrderId))
						.to.be.reverted
				})

				it('rejects unauthorized cancellations',
				async () => {
					await expect(exchange.connect(user2)
						.cancelOrder(1))
						.to.be.reverted
				})
			})
		})

		describe('Filling orders', () => {

			describe('Success', () => {
				beforeEach(async () => {
					transaction = await exchange.connect(user2)
						.fillOrder(1)
					result = await transaction.wait()			
				})

				it('executes the trade and charges fees', async () => {
				//token give
					expect(await exchange.balanceOf(token1.address,
						user1.address)).to.equal(tokens(0))
					expect(await exchange.balanceOf(token1.address,
						user2.address)).to.equal(tokens(1))
					expect(await exchange.balanceOf(token1.address,
						feeAccount.address)).to.equal(tokens(0))

				//token get
					expect(await exchange.balanceOf(token2.address,
						user1.address)).to.equal(tokens(1))
					expect(await exchange.balanceOf(token2.address,
						user2.address)).to.equal(tokens(0.9))
					expect(await exchange.balanceOf(token2.address,
						feeAccount.address)).to.equal(tokens(0.1))
				})

				it('updates filled orders', async () => {
				//token give
					expect(await exchange.orderFilled(1))
						.to.equal(true)
				})


				it('emits a trade event', async () => {
					const event = result.events[0]
					expect(event.event).to.equal('Trade')

					const args = event.args
					expect(args.id).to.equal(1)
					expect(args.user).to.equal(user2.address)
					expect(args.tokenGet).to.equal(token2.address)
					expect(args.amountGet).to.equal(tokens(1))
					expect(args.tokenGive).to.equal(token1.address)
					expect(args.amountGive).to.equal(tokens(1))
					expect(args.creator).to.equal(user1.address)
					expect(args.timestamp).to.at.least(1)
				})
			})

			describe('Failure', () => {
				it('rejects invalid order ids', async () => {
					const invalidOrderId = 99999
					await expect(exchange.connect(user2)
						.fillOrder(invalidOrderId)).to.be.reverted
				}) 

				it('rejects already filled orders', async () => {
					transaction = await exchange.connect(user2)
						.fillOrder(1)
					await transaction.wait()

					await expect(exchange.connect(user2)
						.fillOrder(1)).to.be.reverted
				})

				it('rejects cancelled orders', async () => {
					transaction = await exchange.connect(user1)
						.cancelOrder(1)
					await transaction.wait()

					await expect(exchange.connect(user2)
						.fillOrder(1)).to.be.reverted
				})
			})
		})
	})
})
