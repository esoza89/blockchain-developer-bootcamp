import { createSelector } from 'reselect'
import { get, groupBy, reject, maxBy, minBy } from 'lodash';
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


//---------------Price Chart

export const priceChartSelector = createSelector(
	filledOrders,
	tokens,
	(orders, tokens) => {

		if(!tokens[0] || !tokens[1]) { return }

		//filtering by market pairs
		orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
		orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

		//sort orders by date ascending
		orders = orders.sort((a, b) => a.timestamp - b.timestamp)

		//decorate orders - add display attributes
		orders = orders.map((o) => decorateOrder(o, tokens))

		//get array of two last orders trimming last two values from whole array
		let secondLastOrder, lastOrder
		[secondLastOrder, lastOrder] = orders.slice(orders.lenght - 2, orders.lenght)

		const lastPrice = get(lastOrder, 'tokenPrice', 0)
		const secondLastPrice = get(secondLastOrder, 'tokenPrice', 0)

		return({
			lastPrice,
			lastPriceChange: (lastPrice >= secondLastPrice ? '+' : '-'),
			series: [{
				data: buildGraphData(orders)
			}]
		})
	}
)

const buildGraphData = (orders) => {
	//group the orders by hour for the graph
	orders = groupBy(orders, (o) => moment.unix(o.timestamp).startOf('hour').format())

	const hours = Object.keys(orders) // makes a relation between hours and the orders

	const graphData = hours.map((hour) => {
		//fectch orders in a given hour
		const group = orders[hour]

		//calculate open, high, low and close
		//orders are time sorted so first is open
		const open = group[0]
		const high = maxBy(group, 'tokenPrice')
		const low = minBy(group, 'tokenPrice')
		const close = group[group.length - 1]

		return({
			x: new Date(hour),
			y: [open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice]
		})
	})

	return graphData
}
