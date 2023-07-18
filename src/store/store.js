import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

//import reducers
import { provider, tokens, exchange } from './reducers.js'

const reducer = combineReducers({
	provider, //combines all reducers in one object from imported ones
	tokens,
	exchange
})

const initialState = {}
const middleware = [thunk]
//creating store
const store = createStore(reducer, initialState, composeWithDevTools(applyMiddleware(...middleware)))

export default store;
