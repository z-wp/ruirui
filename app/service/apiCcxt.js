'use strict';

const Service = require('egg').Service;
const ccxt = require('ccxt');

class ApiCcxtService extends Service {

  platformOkex(config) {
    return new ccxt.okex(config);
  }

  platformBinance(config) {
    return new ccxt.binance(config);
  }

  async OHLCV(platform, symbol, timeframe, limit = 20) {

    const list = await platform.fetchOHLCV(symbol, timeframe, undefined, limit);

    return list.map(item => {
      return {
        // time: new Date(item.shift()).toLocaleDateString(),
        time: item.shift(),
        open: item.shift(),
        high: item.shift(),
        low: item.shift(),
        close: item.shift(),
      };
    });

  }

  async lastClosePriceByOHLCV(platform, symbol, timeframe = '1m') {
    const data = await platform.fetchOHLCV(symbol, timeframe, undefined, 1);
    return data && data[0] && data[0][4] || null;
  }

  async lastClosePrice(platform, symbol) {
    const data = await platform.fetchTicker(symbol);
    return data && data.last || null;
  }

  // 获取现货资金量 'account', 'spot', 'margin', 'futures', 'swap'
  async spot(platform) {
    return await platform.fetchBalance({ type: 'spot' });
    // ["USDT": {"free":42.67567516,"used":0,"total":42.67567516}]
  }

  async marketLimitBySymbol(platform, symbol, type = 'spot') {
    const data = (await platform.fetchMarkets()).filter(item => item.type === type && item.symbol === symbol).shift();
    return data && data.limits || null;
    // {"taker":0.0015,"maker":0.001,"id":"ETH-USDT","symbol":"ETH/USDT","base":"ETH","quote":"USDT","baseId":"ETH","quoteId":"USDT",
    //   "info":{"base_currency":"ETH","category":"1","instrument_id":"ETH-USDT","min_size":"0.001","quote_currency":"USDT","size_increment":"0.000001","tick_size":"0.01"},"type":"spot","spot":true,"futures":false,"swap":false,"option":false,"active":true,"precision":{"amount":0.000001,"price":0.01},
    // "limits":{"amount":{"min":0.001},"price":{"min":0.01},"cost":{"min":0.01}}}
  }

  async getLastBuyCoin1Price(platform, symbol) {
    if (platform.id === 'binance') {
      const list = await platform.fetchOrders(symbol, undefined, 1) || [];
      return list;
    }
    const list = await platform.fetchOrdersByState(2, symbol, undefined, 2) || [];
    const item = list && list[0];
    return item && item.side === 'buy' && item.average || null;
    // [{
    // "timestamp":1613375901000,
    // "datetime":"2021-02-15T07:58:21.000Z",
    // "symbol":"ETH/USDT",
    // "id":"74559385",
    // "order":"6464464517024768",
    // "takerOrMaker":"taker",
    // "side":"sell",
    // "price":1750.91,
    // "amount":0.024207,
    // "cost":42.38427837,
    // "fee":{
    //     "cost":0.04238428,
    //     "currency":"USDT"
    // }]
  }

  async spotAccountUSDT(platform) {
    let usdt = 0;
    const totalBalance = await platform.fetchBalance();
    const pairsAmount = [];
    const pairs = [];
    if (totalBalance && totalBalance.info) {
      for (const item of totalBalance.info) {
        if (item.currency === 'USDT') {
          usdt += Number(item.balance);
          continue;
        }
        const pair = item.currency + '/USDT';
        const amount = item.balance;
        pairsAmount.push({ pair, amount });
        pairs.push(pair);
      }
    }
    const map = await platform.fetchTickersByType('spot', pairs);
    // return { pairsAmount, pairs, map };
    for (const sym of pairsAmount) {
      const price = map[sym.pair] && map[sym.pair].last;
      if (price) {
        usdt += Number(price) * Number(sym.amount);
      }
    }
    return parseInt(usdt);
  }

}

module.exports = ApiCcxtService;
