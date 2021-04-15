'use strict';

const Service = require('egg').Service;

class CoinService extends Service {

  explodeCoinPair(pair) {
    return pair.split('/');
  }

  timeframeD2(timeframe) {
    const map = new Map([
      [ '1y', '6M' ],
      [ '6M', '3M' ],
      [ '1d', '6h' ],
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
