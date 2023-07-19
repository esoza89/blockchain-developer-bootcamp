import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadTokens,
  loadExchange,
  subscribeToEvents 
} from '../store/interactions';
import config from '../config.json';
import Navbar from './Navbar'
import Markets from './Markets'
import Balance from './Balance'
import Order from './Order'

function App() {

  const dispatch = useDispatch()

  //function to load blockchain
  const loadBlockchainData = async () => {

    //connect Ethers to blockchain
    const provider = loadProvider(dispatch)

    //fetch current network chanId
    const chainId = await loadNetwork(provider, dispatch) 

    //Reload page when network changes
    window.ethereum.on('chainChanged', () => {
      window.location.reload()
    })

    window.ethereum.on('accountsChanged', () => {
      loadAccount(provider, dispatch)
    })


    //connect to Token smart contracts
    const Efris = config[chainId].Efris
    const mETH = config[chainId].mETH 
    await loadTokens(provider, [Efris.address, mETH.address], dispatch)

    //connect to exchange smart contract
    const exchangeConfig = config[chainId].exchange
    const exchange = await loadExchange(provider, exchangeConfig.address, dispatch)

    subscribeToEvents(exchange, dispatch)
    
  }


  //calls functions when return html code runs 
  useEffect(() => {
    loadBlockchainData()
  })

  return (
    <div>

      <Navbar />

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          <Markets />

          <Balance />
          
          <Order />

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
