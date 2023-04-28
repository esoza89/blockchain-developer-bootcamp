const { ethers } = require ('hardhat');
//pulling ethers from hardhat library
const { expect } = require ('chai');

const tokens = (n) => {
	return ethers.utils.parseUnits(n.toString(), 'ether') //Function to turn ether units to wei
} 

describe ('Token', () => {
//Test go inside here...
	let token,
		accounts,
		deployer,
		receiver,
		exchange

	beforeEach(async () => {
		//fetch token from Blockchain
		const Token = await ethers.getContractFactory
			('Token')
		token = await Token.deploy('Efris Coin',
			'EFRIS',
			 '1000000') //deploys test js BC
		accounts = await ethers.getSigners()
		deployer = accounts[0] //fectching accounts and deployer
		receiver = accounts[1]
		exchange = accounts[2]
	}) 

	describe('Deployment', () => {
		const name = 'Efris Coin'
		const symbol = 'EFRIS'
		const decimals = 18
		const totalSupply = tokens('1000000') 

		it('has correct name', async () => {
		//read and check that the name is correct
		expect(await token.name()).to.equal(name)
		//console.log(await token.name())
		})

		it('has correct symbol', async () => {
			expect(await token.symbol()).to.equal(symbol)
		})

		it('has correct decimals', async () => {
			expect(await token.decimals()).to.equal
				(decimals)
		})

		it('has correct supply', async () => {
			//const supply = tokens('1000000')//turning ether units to wei
			expect(await token.totalSupply()).to.equal
				(totalSupply)
		})

		it('assigns total supply to deployer', async () => {
			expect(await token.balanceOf(deployer.address))
				.to.equal(totalSupply)
		})

	})

	describe('Sending tokens', () => {
		let amount
		let totalSupply
		let remanent
		let transaction
		let result

		describe('Success', () => {
			beforeEach(async () => {
				amount = 100
				totalSupply = 1000000
				remanent = totalSupply - amount
				amount = tokens(amount)
				totalSupply = tokens(totalSupply)
				remanent = tokens(remanent)

				transaction = await token.connect(deployer)
					.transfer(receiver.address, amount)
				result = await transaction.wait()
			})

			it('transfers token balances', async () =>
			{
				//Ensure tokens were transfered
				expect(await token.balanceOf(deployer.address))
					.to.equal(remanent)
				expect(await token.balanceOf(receiver.address))
					.to.equal(amount)
			})

			it('emits a transfer event', async () => {
				const event = result.events[0]
				expect(event.event).to.equal('Transfer')

				const args = event.args
				expect(args.from).to.equal(deployer.address)
				expect(args.to).to.equal(receiver.address)
				expect(args.value).to.equal(amount)
			})
		})

		describe('Failure', () => {
			it('rejects insuficient balances',
				async () => {
				//transfer more tokens that deployer has
				const invalidAmount = tokens(100000000)
				await expect(token.connect(deployer)
					.transfer(receiver.address,
					invalidAmount)).to.be.reverted
			})

			it('rejects wrong receiver',
				async () => {
				//transfer more tokens that deployer has
				const amount = tokens(100)
				await expect(token.connect(deployer)
					.transfer('0x0000000000000000000000000000000000000000',
					amount)).to.be.reverted
			})
		})
	})

	describe('Approving tokens', () => {
		let amount
		let totalSupply
		let remanent
		let transaction
		let result		

		beforeEach(async () => {
		amount = tokens(100)
		transaction = await token.connect(deployer)
			.approve(exchange.address, amount)
		result = await transaction.wait()
		})

		describe ('Success', () => {
			it('allocates an allowance for delegated token spending',
				async () => {
				expect(await token.allowance(deployer.address,
					exchange.address)).to.equal(amount)
			})

			it('emits an approval event', async () => {
				const event = result.events[0]
				expect(event.event).to.equal('Approval')

				const args = event.args
				expect(args.owner).to.equal(deployer.address)
				expect(args.spender).to.equal(exchange.address)
				expect(args.value).to.equal(amount)
			})			
		})

		describe('Failure', () => {
			it('rejects wrong spender',
				async () => {
				//transfer more tokens that deployer has
				const amount = tokens(100)
				await expect(token.connect(deployer)
					.approve('0x0000000000000000000000000000000000000000',
					amount)).to.be.reverted
			})
		})
	})
})
