'use strict';

const Service = require('egg').Service;
const ccxt = require('ccxt');

class ApiCcxtService extends Service {

  platform() {
    return new ccxt.okex(this.config.okex);
  }

  async OHLCV(symbol, timeframe, limit = 20) {

    const okex = this.platform();
    const list = await okex.fetchOHLCV(symbol, timeframe, undefined, limit);

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

  async lastClosePrice(symbol, timeframe = '1m') {
    const data = await this.platform().fetchOHLCV(symbol, timeframe, undefined, 1);
    return data && data[0][4];
  }

  // 获取现货资金量 'account', 'spot', 'margin', 'futures', 'swap'
  async spot(coin = 'USDT') {
    const balance = await this.platform().fetchBalance({ type: 'spot' });
    return balance && balance[coin] || null;
  }

}

module.exports = ApiCcxtService;
