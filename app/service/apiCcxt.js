'use strict';

const Service = require('egg').Service;
const ccxt = require('ccxt');

class ApiCcxtService extends Service {

  platformOkex(config) {
    return new ccxt.okex(config);
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

  async lastClosePrice(platform, symbol, timeframe = '1m') {
    const data = await platform.fetchOHLCV(symbol, timeframe, undefined, 1);
    return data && data[0][4];
  }

  // 获取现货资金量 'account', 'spot', 'margin', 'futures', 'swap'
  async spot(platform) {
    return await platform.fetchBalance({ type: 'spot' });
    // ["USDT": {"free":42.67567516,"used":0,"total":42.67567516}]
  }

  async marketBySymbol(platform, symbol) {
    const markets = await platform.markets();
  }

}

module.exports = ApiCcxtService;
