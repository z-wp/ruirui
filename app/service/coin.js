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
      [ '12h', '4h' ],
      [ '4h', '1h' ],
      [ '2h', '30m' ],
      [ '1h', '15m' ],
      [ '30m', '15m' ],
    ]);

    return map.get(timeframe) || timeframe;
  }
}

module.exports = CoinService;
