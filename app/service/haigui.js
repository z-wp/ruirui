'use strict';

const Service = require('egg').Service;

class HaiguiService extends Service {

  // 计算康安奇通道和ATR
  async algo(symbol, timeframe = '1d', limit = 20) {

    const [ ohlcvList, ticker ] = await Promise.all([
      this.ctx.service.apiCcxt.OHLCV(symbol, timeframe, limit),
      this.ctx.service.apiCcxt.platform().fetchTicker(symbol),
    ]);
    const trList = []; const highList = []; const lowList = [];
    let forward;
    if (!ohlcvList) return null;
    for (const ohlcv of ohlcvList) {
      if (forward !== undefined) {
        const tr = Math.max(ohlcv.high - ohlcv.low, Math.abs(ohlcv.high - forward.close), Math.abs(forward.close - ohlcv.low));
        trList.push(tr);
      }
      forward = ohlcv;
      highList.push(ohlcv.high);
      lowList.push(ohlcv.low);
    }
    if (ticker) {
      trList.push(Math.max(ticker.high - ticker.low, Math.abs(ticker.high - forward.close), Math.abs(forward.close - ticker.low)));
    }
    const avg = function(array) {
      const len = array.length;
      let sum = 0;
      for (let i = 0; i < len; i++) {
        sum += array[i];
      }
      return Math.floor(sum / len);
    };
    const atr = avg(trList);
    return {
      atr,
      don_open: Math.max(...highList),
      don_close: Math.min(...lowList),
    };
  }

  // 计算买卖单位
  async unit(symbol, percent = 0.01, timeframe = '1d') {
    // 当前持有的usdt
    const [ balance, algo ] = await Promise.all([
      this.ctx.service.apiCcxt.spot('USDT'),
      this.algo(symbol, timeframe),
    ]);
    if (balance === null) return null;
    // eslint-disable-next-line dot-notation
    const usdt = balance['USDT'].free;
    if (algo && algo.atr) {
      return usdt * percent / algo.atr;
    }
    return null;
  }

  async spotStrategy(symbol, percent = 0.01, timeframe = '1d') {
    const [ balance, algo ] = await Promise.all([
      this.ctx.service.apiCcxt.spot('USDT'),
      this.algo(symbol, timeframe),
    ]);
    if (balance === null || algo === null) return null;
    // eslint-disable-next-line dot-notation
    const usdt = balance['USDT'].free;
    const unit = usdt * percent / algo.atr;

    // 持空仓

    // 有持仓
  }

}

module.exports = HaiguiService;
