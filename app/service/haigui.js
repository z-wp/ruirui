'use strict';

const Service = require('egg').Service;

class HaiguiService extends Service {

  // 计算康安奇通道和ATR
  async algo(platform, symbol, timeframe = '1d', limit = 20) {

    const [ ohlcvList, ticker ] = await Promise.all([
      this.ctx.service.apiCcxt.OHLCV(platform, symbol, timeframe, limit),
      platform.fetchTicker(symbol),
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
  async unit(platform, symbol, percent = 0.01, timeframe = '1d') {
    // 当前持有的usdt
    const [ balance, algo ] = await Promise.all([
      this.ctx.service.apiCcxt.spot(platform),
      this.algo(platform, symbol, timeframe),
    ]);
    if (balance === null) return null;
    // eslint-disable-next-line dot-notation
    const usdt = balance['USDT'].free;
    if (algo && algo.atr) {
      return usdt * percent / algo.atr;
    }
    return null;
  }

  async spotStrategy(conConfig, platform, symbol, percent = 0.01, timeframe = '1d') {
    const [ balance, algo, symbolLimit ] = await Promise.all([
      this.ctx.service.apiCcxt.spot(platform),
      this.algo(platform, symbol, timeframe),
      this.ctx.service.apiCcxt.marketLimitBySymbol(platform, symbol), // {"amount":{"min":0.001},"price":{"min":0.01},"cost":{"min":0.01}}
    ]);
    if (!balance) return { success: false, message: 'balance获取失败' };
    if (!algo) return { success: false, message: 'algo获取失败' };
    if (!symbolLimit) return { success: false, message: 'symbol的market limit获取失败' };

    const coin1HoldLimit = conConfig && conConfig.coin1JoinQuantity || 0;
    const coin2StartLimit = conConfig && conConfig.coin2JoinQuantity || 0;
    const explode = this.ctx.service.coin.explodeCoinPair(symbol);
    const coin1 = explode[0];
    const coin2 = explode[1];
    const coin1Have = balance[coin1] && balance[coin1].free;
    const coin2Have = balance[coin2] && balance[coin2].free;
    if (coin2Have === undefined) return { success: false, message: 'coin2持有量不存在' };
    if (coin2Have < coin2StartLimit) return { success: false, message: 'coin2持有量不足脚本启动条件' };

    const unit = coin2Have * percent / algo.atr;
    if (unit < symbolLimit.amount.min) return { success: false, message: '计算所得开仓单位小于平台最小下单量' };

    const isHoldPosition = coin1Have >= coin1HoldLimit;

    // 开仓点
    const open_point = algo.don_open;
    // 加仓点(在上一次买入（或加仓）的基础上上涨了0.5atr，则加仓一个Unit)
    const add_point = algo.don_open + 0.5 * algo.atr;
    // 止损点(比最后一次买入价格下跌2atr时，则卖出全部头寸止损)

    // 止盈点(价格跌破二分之一n通道下轨，清仓止盈)
    const clear_point = algo.don_close;

    if (coin1Have > 0) {
      // 有持仓，突破1/2atr加半单位

    } else {
      // 没有持仓，加1单位
    }
  }

  async addStore(platform, symbol, quantity) {

  }

  async clearStore(platform, symbol) {

  }

  async main() {
    try {
      const accountList = await this.ctx.service.record.findUserConfigs();
      if (accountList) {
        for (const account of accountList) {
          if (account.status === 1) {
            const runCoins = await this.ctx.service.record.findCoinConfigs(account.apiKey);
            if (runCoins) {

              let platform;
              if (account.platform === 'okex') {
                platform = this.ctx.service.apiCcxt.platformOkex({
                  apiKey: account.apiKey,
                  secret: account.secret,
                  password: account.passphrase || undefined,
                });
              }
              if (!platform) {
                this.ctx.logger.info(`配置的平台${account.platform}暂不支持`);
                continue;
              }

              for (const coin of runCoins) {
                if (coin.status === 1) {
                  // 运行
                  // {
                  //   id: 2,
                  //   appKey: '54b27c1a-05ed-4936-b4b5-f92b9f82f40f',
                  //   coinPair: 'BTC/USDT',
                  //   coin2JoinQuantity: 100,
                  //   status: 1,
                  //   coin1JoinQuantity: 0.005,
                  // }
                  const res = await this.ctx.service.haigui.spotStrategy(coin, platform, coin.coinPair);
                  if (res && !res.success) {
                    this.ctx.logger.error(res.message);
                  }
                }
              }
            }
          }
        }
      }

      return { success: true, message: '' };
    } catch (error) {
      this.ctx.logger.error(error.message);
      return { success: false, message: error.message };
    }
  }

}

module.exports = HaiguiService;
