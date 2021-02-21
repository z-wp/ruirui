'use strict';

const Service = require('egg').Service;

class CoinService extends Service {

  async explodeCoinPair(pair) {
    return pair.split('/');
  }

  async timeframeD2(timeframe) {
    const map = new Map([
      [ '1y', '6M' ],
      [ '6M', '3M' ],
      [ '1d', '12h' ],
      [ '12h', '6h' ],
      [ '4h', '2h' ],
      [ '2h', '1h' ],
      [ '1h', '30m' ],
      [ '30m', '15m' ],
    ]);

    return map.get(timeframe) || timeframe;
  }
}

module.exports = CoinService;
