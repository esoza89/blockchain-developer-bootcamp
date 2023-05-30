export const provider = (state = {}, action) => { //default state is empty object
  switch (action.type) {
    case 'PROVIDER_LOADED':
      return {
        ...state,//update state
        connection: action.connection //returns the connection to the state
      }

    case 'NETWORK_LOADED':
      return {
        ...state,
        chainID: action.chainId
      }

    case 'ACCOUNT_LOADED':
      return {
        ...state,
        account: action.account
      }

    case 'ETHER_BALANCE_LOADED':
      return {
        ...state,
        balance: action.balance
      }

    default:
      return state
  }
}

const DEFAULT_TOKENS_STATE = {
  loaded: false,
  contracts: [],
  symbols: []
}

export const token = (state = DEFAULT_TOKENS_STATE, action) => { //new reducers need to be added to store
  switch (action.type) {
    case 'TOKEN_1_LOADED':
      return {
        ...state,
        loaded: true,
        contracts: [...state.contracts, action.token],
        symbols: [...state.symbols, action.symbol] 
      }

    case 'TOKEN_2_LOADED':
      return {
        ...state,
        loaded: true,
        contracts: [...state.contracts, action.token],
        symbols: [...state.symbols, action.symbol] 
      }

    default:
      return state
  }
}

export const exchange = (state = { loaded: false, contract: {} }, action) => { 
  switch (action.type) {
    case 'EXCHANGE_LOADED':
      return {
        ...state,
        loaded: true,
        contract: action.exchange
      }

    default:
      return state
  }
}
