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
  allOrders:{
    loaded: false,
    data:[]
  },  
  cancelledOrders:{
    data:[]
  },
    filledOrders:{
    data:[]
  },
  events: []
}

export const exchange = (state = DEFAULT_EXCHANGE_STATE, action) => { 
  let data, index

  switch (action.type) {
    case 'EXCHANGE_LOADED':
      return {
        ...state,
        loaded: true,
        contract: action.exchange
      }

    case 'CANCELLED_ORDERS_LOADED':
      return {
        ...state,
        cancelledOrders: {
          loaded: true,
          data: action.cancelledOrders
        }
      }

    case 'FILLED_ORDERS_LOADED':
      return {
        ...state,
        filledOrders: {
          loaded: true,
          data: action.filledOrders
        }
      }

    case 'ALL_ORDERS_LOADED':
      return {
        ...state,
        allOrders: {
          loaded: true,
          data: action.allOrders
        }
      }

//cancel orders------------------------------------------------
    case 'ORDER_CANCEL_REQUEST':
      return {
        ...state,
        transaction: {
          transactionType: 'Cancel',
          isPending: true,
          isSuccesful: false
        }
      } 

    case 'ORDER_CANCEL_SUCCESS':
      return {
        ...state,
        transaction: {
          transactionType: 'Cancel',
          isPending: false,
          isSuccesful: true
        },
        cancelledOrders: {
          ...state.cancelledOrders,
          data:[
            ...state.cancelledOrders.data,
            action.order
          ]
        },
        events: [action.event, ...state.events]
      } 

    case 'ORDER_CANCEL_FAIL':
      return {
        ...state,
        transaction: {
          transactionType: 'Cancel',
          isPending: false,
          isSuccesful: false,
          isError: true
        }
      } 


//fill orders------------------------------------------------
    case 'ORDER_FILL_REQUEST':
      return {
        ...state,
        transaction: {
          transactionType: 'Fill Order',
          isPending: true,
          isSuccesful: false
        }
      } 

    case 'ORDER_FILL_SUCCESS':
      //prevent duplicate orders
      index = state.filledOrders.data.findIndex(order => order.id.toString() === action.order.id.toString())

      if (index === -1) {
        data = [...state.filledOrders.data, action.order]
      } else {
        data = state.filledOrders.data
      }

      return {
        ...state,
        transaction: {
          transactionType: 'Fill Order',
          isPending: false,
          isSuccesful: true
        },
        filledOrders: {
          ...state.filledOrders,
          data
        },
        events: [action.event, ...state.events]
      } 

    case 'ORDER_FILL_FAIL':
      return {
        ...state,
        transaction: {
          transactionType: 'Fill Order',
          isPending: false,
          isSuccesful: false,
          isError: true
        }
      } 


//Balance cases
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


    case 'NEW_ORDER_REQUEST':
      return {
        ...state,
        transaction: {
          transactionType: 'New Order',
          isPending: true,
          isSuccesful: false
        }
      }

    case 'NEW_ORDER_SUCCESS':
      index = state.allOrders.data.findIndex(order => order.id.toString() === action.order.id.toString())

      if (index === -1) {
        data = [...state.allOrders.data, action.order] //append
      } else {
        data = [state.allOrders.data] //replace
      }

      return {
        ...state,
        allOrders: {
          ...state.allOrders,
          data
        },
        transaction: {
          transactionType: 'New Order',
          isPending: false,
          isSuccesful: true
        },
        events: [action.event, ...state.events]
      }


    case 'NEW_ORDER_FAIL':
      return {
        ...state,
        transaction: {
          transactionType: 'New Order',
          isPending: false,
          isSuccesful: false,
          isError: true
        },
      }


    default:
      return state
  }
}
