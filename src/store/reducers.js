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

    default:
      return state
  }
}

export const token = (state = { loaded: false, contract: null}, action) => { //new reducers need to be added to store
  switch (action.type) {
    case 'TOKEN_LOADED':
      return {
        ...state,
        loaded: true,
        contract: action.token,
        symbil: action.symbol
      }

    default:
      return state
  }
}
