import { createSelector } from 'reselect'
import { get, groupBy, reject } from 'lodash';
import { ethers } from 'ethers';
import moment from 'moment'

const GREEN = '#25CE8F'
const RED = '#F45353'

//fectching tokens and orders from state
const tokens = state => get(state, 'tokens.contracts')
const allOrders = state => get(state, 'exchange.allOrders.data', [])
const cancelledOrders = state => get(state, 'exchange.cancelledOrders.data', [])
const filledOrders = state => get(state, 'exchange.filledOrders.data', [])



const openOrders = state => {
	const all = allOrders(state)
	const filled = filledOrders(state)
	const cancelled = cancelledOrders(state)

	//from all orders reject the filled if present
	const openOrders = reject(all, (order) => {
		const orderFilled = filled.some((o) => o.id.toString() === order.id.toString())
		const orderCancelled = cancelled.some((o) => o.id.toString() === order.id.toString())
		return(orderFilled || orderCancelled)
	})

	return openOrders

}

//formating
const decorateOrder = (order, tokens) => {
	let token0Amount, token1Amount, tokenPrice


	if(order.tokenGive === tokens[1].address) {
		token0Amount = order.amountGive
		token1Amount = order.amountGet
	} else {
		token0Amount = order.amountGet
		token1Amount = order.amountGive		
	}

	const precision = 100000
	tokenPrice = (token1Amount / token0Amount)
	tokenPrice = Math.round(tokenPrice * precision) / precision

	return{
		...order,
		token0Amount: ethers.utils.formatUnits(token0Amount, "ether"),
		token1Amount: ethers.utils.formatUnits(token1Amount, "ether"),
		tokenPrice,
		formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ssa d MMM D')
	}

}



//orderbook selector
export const orderBookSelector = createSelector(
	openOrders,
	tokens,
	(orders, tokens) => {

	if(!tokens[0] || !tokens[1]) { return }

	//filtering by market pairs
	orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
	orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

	orders = decorateOrderBookOrders(orders, tokens)

//order by orderType with LODASH

	orders = groupBy(orders, 'orderType')

//fetch buy orders
	const buyOrders = get(orders, 'buy', [])
//sort orders by price


	orders = {
		...orders,
		buyOrders: buyOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
	}

	const sellOrders = get(orders, 'sell', [])

	orders = {
		...orders,
		sellOrders: sellOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
	}

	return orders

})

const decorateOrderBookOrders = (orders, tokens) => {
	return(
		orders.map((order) => {
			order = decorateOrder(order, tokens)
			order = decorateOrderBookOrder(order, tokens)
			return(order)
		})
	)
}


const decorateOrderBookOrder = (order, tokens) => {
	const orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'
	return({
		...order,
		orderType,
		orderTypeClass: (orderType === 'buy' ? GREEN : RED),
		orderFillAction: (orderType === 'buy' ? 'sell' : 'buy')
	})
}
