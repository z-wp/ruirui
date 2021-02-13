'use strict';

const Service = require('egg').Service;
const ccxt = require('ccxt');

class ApiCcxtService extends Service {

  async OHLCV(symbol, timeframe, limit = 20) {

    const okex = new ccxt.okex(this.config.okex);
    const list = await okex.fetchOHLCV(symbol, timeframe, undefined, limit);

    return list.map(item => {
      return {
        time: new Date(item.shift()).toLocaleDateString(),
        open: item.shift(),
        high: item.shift(),
        low: item.shift(),
        close: item.shift(),
      };
    });

  }
}

module.exports = ApiCcxtService;
