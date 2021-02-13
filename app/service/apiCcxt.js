'use strict';

const Service = require('egg').Service;
const ccxt = require('ccxt');

class ApiCcxtService extends Service {

  params() {
    return {
      n: 20, // 计算唐奇安通道的参数
      symbol: 'ETH/USDT', // 合约标的
      ratio: 0.8, // 交易最大资金比率
    };
  }

  async OHLCV(symbol, timeframe, limit = 21) {

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
