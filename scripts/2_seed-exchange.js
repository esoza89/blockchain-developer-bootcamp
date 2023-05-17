const config = require("../src/config")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const wait = (seconds) => {
  const miliseconds = seconds * 1000
  return new Promise(resolve => setTimeout(resolve, miliseconds))
}

async function main() {
  //Fetch accounts from wallet, unlocked
  const accounts = await ethers.getSigners()

  //fetch network Id
  const { chainId } = await ethers.provider.getNetwork()
  console.log("Using chainId:", chainId)

  //Fetch deployed tokens
  const Efris = await ethers.getContractAt('Token', config[chainId].Efris.address)
  console.log(`Efris token fetched to: ${Efris.address}\n`)

  const Karen = await ethers.getContractAt('Token', config[chainId].Karen.address)
  console.log(`Karen token fetched to: ${Karen.address}\n`)

  const mETH = await ethers.getContractAt('Token', config[chainId].mETH.address)
  console.log(`mEth token fetched to: ${mETH.address}\n`)  

  //Fetch deployed Exchange
  const exchange = await ethers.getContractAt('Exchange', config[chainId].exchange.address)
  console.log(`Exchange fetched to: ${exchange.address}\n`) 

  //Give tokens to account[1] or AKA user2
  const sender = accounts[0]
  const receiver = accounts[1]
  let amount = tokens(10000)
  let transaction, result

  transaction = await mETH.connect(sender).transfer(receiver.address, amount)
  console.log(`Transfered ${amount} mETH tokens from\n ${sender.address}\nto\n ${receiver.address}\n`)

  //setting users for the exchange
  const user1 = accounts[0]
  const user2 = accounts[1]
  amount = tokens(10000)

  //User1 approves 10,000 Efris
  transaction = await Efris.connect(user1).approve(exchange.address, amount)
  console.log(`Approved ${amount} Efris from ${user1.address}\n`)

  //User1 transfers 10,000 Efris to exchange
  transaction = await exchange.connect(user1).depositToken(Efris.address, amount)
  console.log(`Deposited ${amount} Efris from ${user1.address}\n`)

  //User2 approves 10,000 mETH
  transaction = await mETH.connect(user2).approve(exchange.address, amount)
  console.log(`Approved ${amount} mETH from ${user2.address}\n`)

  //User2 transfers 10,000 mETH to exchange
  transaction = await exchange.connect(user2).depositToken(mETH.address, amount)
  console.log(`Deposited ${amount} mETH from ${user2.address}\n`)

  ///////Seed canceled orders//////////////
  let orderId
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), Efris.address, tokens(5))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}\n`)


  orderId = result.events[0].args.id
  transaction = await exchange.connect(user1).cancelOrder(orderId)
  result = await transaction.wait()
  console.log(`Cancelled order from ${user1.address}\n`)


  //await 1 second
  await wait(1)


  /////Fill orders/////
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), Efris.address, tokens(10))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}\n`)

  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  console.log(`Filled order from ${user1.address}\n`)

  //await 1 second
  await wait(1)


//Fill second order
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(50), Efris.address, tokens(15))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}\n`)

  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  console.log(`Filled order from ${user1.address}\n`)

  //await 1 second
  await wait(1)


  //Fill final order
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(200), Efris.address, tokens(20))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}\n`)

  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  console.log(`Filled order from ${user1.address}\n`)

  //await 1 second
  await wait(1)

/////Create open orders/////
//user1
for (i = 1; i <= 10; i++) {
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(10 * i), Efris.address, tokens(10))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}`)
  await wait(1)
}

//user2
for (i = 1; i <= 10; i++) {
  transaction = await exchange.connect(user2).makeOrder(Efris.address, tokens(10), mETH.address, tokens(10 * i))
  result = await transaction.wait()
  console.log(`Made order from ${user2.address}`)
  await wait(1)
}

}


main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});
