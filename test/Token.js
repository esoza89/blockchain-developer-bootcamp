const { ethers } = require ('hardhat');
//pulling ethers from hardhat library
const { expect } = require ('chai');

const tokens = (n) => {
	return ethers.utils.parseUnits(n.toString(), 'ether') //Function to turn ether units to wei
} 

describe ('Token', () => {
//Test go inside here...
	let token

	beforeEach(async () => {
		//fetch token from Blockchain
		const Token = await ethers.getContractFactory('Token')
		token = await Token.deploy('Efris Coin','EFRIS', '1000000') //deploys test js BC
	}) 

	describe('Deployment', () => {
		const name = 'Efris Coin'
		const symbol = 'EFRIS'
		const decimals = 18
		const totalSupply = tokens('1000000') 

		it('has correct name', async () => {
		//read and check that the name is correct
		expect(await token.name()).to.equal(name)
		console.log(await token.name())
		})

		it('has correct symbol', async () => {
			expect(await token.symbol()).to.equal(symbol)
			console.log(await token.symbol())
		})

		it('has correct decimals', async () => {
			expect(await token.decimals()).to.equal(decimals)
			console.log(await token.decimals())
		})

		it('has correct supply', async () => {
			//const supply = tokens('1000000')//turning ether units to wei
			expect(await token.totalSupply()).to.equal(totalSupply)
			console.log(await token.totalSupply())
		})
	})

})
