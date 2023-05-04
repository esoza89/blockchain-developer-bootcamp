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
		user1

	const feePercent = 10

	beforeEach(async () => {
		accounts = await ethers.getSigners()
		deployer = accounts[0]
		feeAccount = accounts[1]
		user1 = accounts[2]

		const Exchange = await ethers.getContractFactory
			('Exchange')
		const Token = await ethers.getContractFactory
			('Token')
		exchange = await Exchange.deploy
			(feeAccount.address, feePercent)
		token1 = await Token.deploy
			('Efris Coin', 'EFRIS', '1000000')

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
})
