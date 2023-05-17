async function main() {
  console.log('Preparing deployment...\n')
  //fetch contracts to deploy
  const Token = await ethers.getContractFactory('Token')
  const Exchange = await ethers.getContractFactory('Exchange')

  //fetch accounts
  const accounts = await ethers.getSigners()
  console.log(`Accounts fetched:\n${accounts[0].address}\n${accounts[1].address}\n`)

  // Deploy contracts
  const efris = await Token.deploy('Efris Coin', 'EFRIS', 1000000)
  await efris.deployed()
  console.log(`Efris deployed to: ${efris.address}`)

  const karen = await Token.deploy('Karen Coin', 'KAREN', 1000000)
  await karen.deployed()
  console.log(`Karen deployed to: ${karen.address}`)

  const mETH = await Token.deploy('mEth', 'mETH', 1000000)
  await efris.deployed()
  console.log(`mETH deployed to: ${mETH.address}`)  

  const exchange = await Exchange.deploy(accounts[1].address, 10)
  await exchange.deployed()
  console.log(`Exchange deployed to: ${exchange.address}`) 

  const { chainId } = await ethers.provider.getNetwork()
  console.log("Using chainId:", chainId)
}


main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});
