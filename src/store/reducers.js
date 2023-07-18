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
        chainId: action.chainId
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

export const tokens = (state = DEFAULT_TOKENS_STATE, action) => { //new reducers need to be added to store
  switch (action.type) {
    case 'TOKEN_1_LOADED':
      return {
        ...state,
        loaded: true,
        contracts: [action.token], // replaced contracts to one token only
        symbols: [action.symbol] 
      }

    case 'TOKEN_1_BALANCE_LOADED':
      return {
        ...state,
        balances: [action.balance] 
      }

    case 'TOKEN_2_BALANCE_LOADED':
      return {
        ...state,
        balances: [...state.balances, action.balance] 
      }


    case 'TOKEN_2_LOADED':
      return {
        ...state,
        loaded: true,
        contracts: [...state.contracts, action.token], //added to contract 2nd token
        symbols: [...state.symbols, action.symbol] 
      }

    default:
      return state
  }
}


const DEFAULT_EXCHANGE_STATE = {
  loaded: false,
  contract: {},
  transaction: {
    isSuccessful: false
  },
  events: []
}

export const exchange = (state = DEFAULT_EXCHANGE_STATE, action) => { 
  switch (action.type) {
    case 'EXCHANGE_LOADED':
      return {
        ...state,
        loaded: true,
        contract: action.exchange
      }

    case 'EXCHANGE_TOKEN_1_BALANCE_LOADED':
      return {
        ...state,
        balances: [action.balance]
      }
    
    case 'EXCHANGE_TOKEN_2_BALANCE_LOADED':
      return {
        ...state,
        balances: [...state.balances, action.balance] //...appends
      }

    case 'TRANSFER_REQUEST':
      return {
        ...state,
        transaction: {
          transactionType: 'Transfer',
          isPending: true,
          isSuccesful: false
        },
        transferInProgress: true
      }

    case 'TRANSFER_SUCCESS':
      return {
        ...state,
        transaction: {
          transactionType: 'Transfer',
          isPending: false,
          isSuccesful: true
        },
        transferInProgress: false,
        events: [action.event, ...state.events]
      }

    case 'TRANSFER_FAIL':
      return {
        ...state,
        transaction: {
          transactionType: 'Transfer',
          isPending: false,
          isSuccesful: false,
          isError: true
        },
        transferInProgress: false,
        events: [action.event, ...state.events]
      }

    default:
      return state
  }
}
