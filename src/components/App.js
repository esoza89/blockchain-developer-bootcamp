import { useEffect } from 'react';
import { ethers } from 'ethers';
import '../App.css';
import TOKEN_ABI from '../abis/Token.json'
import config from '../config.json' 

function App() {

  //funtion to load blockchain
  const loadBlockchainData = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    console.log(accounts[0])

    //connect Ethers to blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum) // window.ethereum is the connection with metamask
    const { chainId } = await provider.getNetwork() // the {} calls the specific value corresponding the tag from object 
    console.log(chainId)

    //connect to Token smart contract
    const token = new ethers.Contract(config[chainId].Efris.address, TOKEN_ABI, provider)
    console.log(token.address)
    const symbol = await token.symbol()
    console.log(symbol)

  }


  //calls functions when return html code runs 
  useEffect(() => {
    loadBlockchainData()
  })

  return (
    <div>

      {/* Navbar */}

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;