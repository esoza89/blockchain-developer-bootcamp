import logo from '../assets/logo1.png'
import eth from '../assets/eth.svg'
import {useSelector, useDispatch} from 'react-redux'
import Blockies from 'react-blockies'
import {loadAccount} from '../store/interactions.js'
import config from '../config.json';

const Navbar = () => {
  const provider = useSelector(state => state.provider.connection)
  const chainId = useSelector(state => state.provider.chainId)
  const dispatch = useDispatch()
  const account = useSelector(state => state.provider.account)
  const balance = useSelector(state => state.provider.balance)
  const connectHandler = async () => {
    await loadAccount(provider, dispatch)
  }
  const networkHandler = async (e) => {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: e.target.value }]
    })
  }

  return(
    <div className='exchange__header grid'>
      <div className='exchange__header--brand flex'>
        <img src={logo} className='logo' alt='logo'></img>
        <h1>Cyber Exchange</h1>
      </div>

      <div className='exchange__header--networks flex'>
        <img src={eth} alt="ETH Logo" className="ETH Logo"></img>

        {chainId && (
          <select name="networks" id="networks" value={config[chainId] ? `0x${chainId.toString(16)}` : `0`} onChange={networkHandler}>
            <option value="0" disabled>Select Network</option>
            <option value="0x7A69">Localhost</option>
            <option value="0xaa36a7">Sepolia</option>
            <option value="0x13881">Mumbai</option>
          </select>
        )}

      </div>

      <div className='exchange__header--account flex'>

        {balance ? (
          <p><small>My balance</small>{Number(balance).toFixed(4)}</p>
        ) : (
        <p><small>My balance</small>0 ETH</p>
        )}

        {account ? (
          <a 
            href={config[chainId] ? `${config[chainId].explorerURL}/address/${account}` : `#`}
            target='_blank'
            rel='noreferrer'
          >
            {account.slice(0,5) + '...' + account.slice(38,42)}
            <Blockies
              seed={account}
              size={10}
              scale={2}
              //color="#2187d0"
              //bgColor="#1b2073"
              //spotColor="#767f92"
              className="identicon"
            />
          </a>
        ) : (
          <button className='button' onClick={connectHandler} >Connect</button>
        )}
      </div>
    </div>
  )
}

export default Navbar;
