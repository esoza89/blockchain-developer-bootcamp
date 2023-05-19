import { useEffect } from 'react';
import { useDispatch } from 'react-redux'
import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadToken 
} from '../store/interactions';
import config from '../config.json'


function App() {

  const dispatch = useDispatch()

  //function to load blockchain
  const loadBlockchainData = async () => {
    await loadAccount(dispatch)

    //connect Ethers to blockchain
    const provider = loadProvider(dispatch)
    const chainId = await loadNetwork(provider, dispatch) 

    //connect to Token smart contract
    await loadToken(provider, config[chainId].Efris.address, dispatch)
    
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
