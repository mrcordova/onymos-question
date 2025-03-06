const tickers = [
  "AAPL",
  "GOOGL",
  "AMZN",
  "MSFT",
  "TSLA",
  "FB",
  "NVDA",
  "NFLX",
  "PYPL",
  "ADBE",
  "NXPI",
  "ADI",
  "MCHP",
  "AVGO",
  "ON",
  "MRVL",
  "TER",
  "SLAB",
  "SYNA",
  "CREE",
  "IBM",
  "GE",
  "F",
  "GM",
  "TWTR",
  "SNAP",
  "UBER",
  "LYFT",
  "SHOP",
  "SQ",
  "ZM",
  "ROKU",
  "SPOT",
  "PINS",
  "BYND",
  "PTON",
  "DOCU",
  "CRWD",
  "OKTA",
  "MDB",
];
class OrderBook {
  static sortBy = {
    buy: (a, b) => a.price - b.price,
    sell: (a, b) => b.price - a.price,
  };

  constructor() {
    this.orders = {
      buy: [],
      sell: [],
    };
  }

  insert(orderType, tickerSymbol, quantity, price) {
    this.orders[orderType].unshift({ tickerSymbol, quantity, price });
    this.orders[orderType].sort(OrderBook.sortBy[orderType]);
  }

  match(orderType, tickerSymbol, price) {
    const oppOrderType = orderType === "buy" ? "sell" : "buy";
    let oppOrderIdx = "sell";
    const orderIdx = this.orders[orderType].findIndex(
      (o) => o.tickerSymbol == tickerSymbol && o.price == price
    );
    const currOrder = this.orders[orderType][orderIdx];
    let oppOrder;
    if (orderType == "buy") {
      oppOrderIdx = this.orders[oppOrderType].findIndex(
        (ord) => ord.tickerSymbol == tickerSymbol && ord.price <= price
      );
    } else {
      oppOrderIdx = this.orders[oppOrderType].findIndex(
        (ord) => (ord.tickerSymbol == tickerSymbol) & (ord.price > price)
      );
    }

    oppOrder = this.orders[oppOrderType][oppOrderIdx];
    while (
      oppOrder != undefined &&
      this.orders[orderType][orderIdx] == currOrder
    ) {
      const quantity = Math.min(currOrder.quantity, oppOrder.quantity);
      currOrder.quantity -= quantity;
      oppOrder.quantity -= quantity;
      if (currOrder.quantity == 0) this.orders[orderType].splice(orderIdx, 1);
      if (oppOrder.quantity == 0)
        this.orders[oppOrderType].splice(oppOrderIdx, 1);
      if (orderType == "buy") {
        oppOrderIdx = this.orders[oppOrderType].findIndex(
          (ord) => ord.tickerSymbol == tickerSymbol && ord.price <= price
        );
      } else {
        oppOrderIdx = this.orders[oppOrderType].findIndex(
          (ord) => (ord.tickerSymbol == tickerSymbol) & (ord.price > price)
        );
      }

      oppOrder = this.orders[oppOrderType][oppOrderIdx];
    }
  }

  *[Symbol.iterator]() {
    for (const [orderType, orders] of Object.entries(this.orders)) {
      for (const order of orders) {
        yield `${orderType} - stock: ${order.tickerSymbol}, quantity: ${order.quantity}, price: ${order.price}`;
      }
    }
  }
}

const orderBook = new OrderBook();

// Implement a real-time Stock trading engine for matching Stock Buys with Stock Sells.
// 1. Write an ‘addOrder’ function that will have the following parameters:
//       ‘Order Type’ (Buy or Sell), ‘Ticker Symbol’, ‘Quantity’, ‘Price’
//       Support 1,024 tickers (stocks) being traded.
//       Write a wrapper to have this ‘addOrder’ function randomly execute with different parameter values to simulate active stock transactions.
function addOrder(orderType, tickerSymbol, quantity, price) {
  orderBook.insert(orderType, tickerSymbol, quantity, price);
  matchOrder(orderType, tickerSymbol, price);
}

function wrapper(addOrder) {
  return function (numOfLoops = 1024) {
    for (let i = 0; i < numOfLoops; i++) {
      // chooses random value from 0 to length of tickers array, change tickers.length if you'd like to change idx range
      const tickerIdx = Math.floor(Math.random() * tickers.length);
      const ticker = tickers[tickerIdx];

      const orderType = Math.ceil(Math.random() * 2) == 1 ? "buy" : "sell";
      const quantity = Math.ceil(Math.random() * 1000);
      const price = parseFloat((Math.random() * (500 - 1) + 1).toFixed(2));
      addOrder(orderType, ticker, quantity, price);
    }
  };
}

// 2. Write a ‘matchOrder’ function, that will match Buy & Sell orders with the following criteria:
//       Buy price for a particular ticker is greater than or equal to lowest Sell price available then.
//       Write your code to handle race conditions when multiple threads modify the Stock order book, as run in real-life, by multiple stockbrokers. Also, use lock-free data structures.
//       Do not use any dictionaries, maps or equivalent data structures. Essentially there should be no ‘import’-s nor ‘include’-s nor similar construct relevant to the programming language you are using that provides you dictionary, map or equivalent data structure capability. In essence, you are writing the entire code. Standard language-specific non data structure related items are ok, but try to avoid as best as you can.
//       Write your ‘matchOrder’ function with a time-complexity of O(n), where 'n' is the number of orders in the Stock order book.
function matchOrder(orderType, tickerSymbol, price) {
  orderBook.match(orderType, tickerSymbol, price);
}

const test = wrapper(addOrder);
// pass in 'n' where 'n' is the number of orders in the Stock order book. if none given, it defaults to 1,024
test();
for (const order of orderBook) {
  console.log(order);
}
