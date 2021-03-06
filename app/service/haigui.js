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
      return sum / len;
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
    if (conConfig && conConfig.timeframe) {
      timeframe = conConfig.timeframe;
    }
    const [ balance, algo, symbolLimit, lastClosePrice ] = await Promise.all([
      this.ctx.service.apiCcxt.spot(platform),
      this.algo(platform, symbol, timeframe),
      this.ctx.service.apiCcxt.marketLimitBySymbol(platform, symbol), // {"amount":{"min":0.001},"price":{"min":0.01},"cost":{"min":0.01}}
      this.ctx.service.apiCcxt.lastClosePrice(platform, symbol),
    ]);
    if (!balance) return { success: false, message: 'balance获取失败' };
    if (!algo) return { success: false, message: 'algo获取失败' };
    if (!symbolLimit) return { success: false, message: 'symbol的market limit获取失败' };
    if (!lastClosePrice) return { success: false, message: `${symbol}最新成交价获取失败,超出请求限制` };

    const coin1HoldLimit = conConfig && conConfig.coin1JoinQuantity || 0;
    const coin2StartLimit = conConfig && conConfig.coin2JoinQuantity || 0;
    const explode = this.ctx.service.coin.explodeCoinPair(symbol);
    const coin1 = explode[0];
    const coin2 = explode[1];
    const coin1Have = balance[coin1] && balance[coin1].free;
    const coin2Have = balance[coin2] && balance[coin2].free;
    if (coin2Have === undefined) return { success: false, message: '本金币持有量不存在' };

    const per = 1 / symbolLimit.amount.min;
    const unit = Math.ceil(coin2Have * percent / algo.atr * per) / per;
    if (unit < symbolLimit.amount.min) return { success: false, message: '计算所得开仓单位小于平台最小下单量' };

    const isHoldPosition = coin1Have >= coin1HoldLimit;

    // 开仓点
    const open_point = algo.don_open;
    // 加仓点(在上一次买入（或加仓）的基础上上涨了0.5atr，则加仓一个Unit)
    // 止损点(比最后一次买入价格下跌2atr时，则卖出全部头寸止损)
    // 止盈点(价格跌破二分之一n通道下轨，清仓止盈)

    if (isHoldPosition) {
      // 止盈
      const winAlgo = await this.algo(platform, symbol, this.ctx.service.coin.timeframeD2(timeframe));
      if (!winAlgo) return { success: false, message: '止盈点algo获取失败' };
      const winPoint = winAlgo.don_close;
      if (lastClosePrice < winPoint) {
        // 清仓止盈
        const res = await this.clearStore(platform, symbol, coin1Have);
        if (!res || !res.info.result) {
          return { success: false, message: `stop win error ${res.info.error_message}` };
        }
        return { success: true, message: `${symbol}成功止盈` };
      }

      const lastBuyPrice = await this.ctx.service.apiCcxt.getLastBuyCoin1Price(platform, symbol);
      if (!lastBuyPrice) return { success: false, message: `${symbol}持仓了, 但最近一条记录不是市价加仓记录` };

      // 止损
      const stopLossPoint = lastBuyPrice - 2 * algo.atr;
      if (lastClosePrice < stopLossPoint) {
        // 清仓止损
        const res = await this.clearStore(platform, symbol, coin1Have);
        if (!res || !res.info.result) {
          return { success: false, message: `stop loss error ${res.info.error_message}` };
        }
        return { success: true, message: `${symbol}成功止损` };
      }

      // 有持仓，突破1/2atr加1单位
      const addPoint = lastBuyPrice + 0.5 * algo.atr;
      const addEnd = open_point + 2 * algo.atr;
      if (lastClosePrice > addPoint && lastClosePrice < addEnd && unit > symbolLimit.amount.min) {
        const res = await this.addStore(platform, symbol, unit, lastClosePrice);
        if (!res || !res.info.result) {
          return { success: false, message: `addStore again error ${res.info.error_message}` };
        }
        return { success: true, message: `${symbol}成功加仓1单位` };
      }
    } else {
      if (coin2Have < coin2StartLimit) return { success: true, message: `${symbol}本金币持有量不足脚本预设开仓条件` };
      if (unit < symbolLimit.amount.min) return { success: true, message: `${symbol}本金币持有量不足平台开仓条件` };
      // 没有持仓，开1单位
      if (lastClosePrice > open_point) {
        const res = await this.addStore(platform, symbol, unit, lastClosePrice);
        if (!res || !res.info.result) {
          return { success: false, message: `addStore error ${res.info.error_message}` };
        }
        return { success: true, message: `${symbol}成功开仓1单位` };
      }
    }
    return { success: true, message: '' };
  }

  async addStore(platform, symbol, quantity, price) {
    return await platform.createOrder(symbol, 'market', 'buy', quantity, price);
    // {"info":{"client_oid":"","code":"0","error_code":"0","error_message":"","message":"","order_id":"6511131220335617","result":true},
    // "id":"6511131220335617","symbol":"ETH/USDT","type":"market","side":"buy"}
  }

  async clearStore(platform, symbol, quantity) {
    return await platform.createOrder(symbol, 'market', 'sell', quantity);
    // {"info":{"client_oid":"","code":"0","error_code":"0","error_message":"","message":"","order_id":"6511182790223873","result":true},
    // "id":"6511182790223873","symbol":"ETH/USDT","type":"market","side":"sell"}
  }

  async main() {
    // return { success: false, message: '测试' };
    try {
      const accountList = await this.ctx.service.record.findUserConfigs();
      if (accountList) {
        for (const account of accountList) {
          if (account && account.state === 1) {

            let platform;
            if (account.platform === 'okex') {
              platform = this.ctx.service.apiCcxt.platformOkex({
                apiKey: account.apiKey,
                secret: account.secret,
                password: account.passphrase || undefined,
              });
            }
            if (!platform) {
              return { success: false, message: `配置的平台${account.platform}暂不支持` };
            }

            // 延时500ms
            const start = (new Date()).getTime();
            const delay = 600;
            while ((new Date()).getTime() - start < delay) {
              continue;
            }

            // 运行
            // {
            //   id: 2,
            //   appKey: '54b27c1a-05ed-4936-b4b5-f92b9f82f40f',
            //   coinPair: 'BTC/USDT',
            //   coin2JoinQuantity: 100,
            //   status: 1,
            //   coin1JoinQuantity: 0.005,
            // }
            const res = await this.ctx.service.haigui.spotStrategy(account, platform, account.coinPair);
            if (res && !res.success) {
              return { success: false, message: res.message };
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

  async strategyAnalysis(conConfig, platform, symbol, percent = 0.01, timeframe = '1d') {
    if (conConfig && conConfig.timeframe) {
      timeframe = conConfig.timeframe;
    }
    const [ balance, algo, symbolLimit, lastClosePrice ] = await Promise.all([
      this.ctx.service.apiCcxt.spot(platform),
      this.algo(platform, symbol, timeframe),
      this.ctx.service.apiCcxt.marketLimitBySymbol(platform, symbol), // {"amount":{"min":0.001},"price":{"min":0.01},"cost":{"min":0.01}}
      this.ctx.service.apiCcxt.lastClosePrice(platform, symbol),
    ]);
    if (!balance) return { success: false, message: 'balance获取失败' };
    if (!algo) return { success: false, message: 'algo获取失败' };
    if (!symbolLimit) return { success: false, message: `${symbol}的market limit获取失败` };
    if (!lastClosePrice) return { success: false, message: `${symbol}最新成交价获取失败` };

    const coin1HoldLimit = conConfig && conConfig.coin1JoinQuantity || 0;
    // const coin2StartLimit = conConfig && conConfig.coin2JoinQuantity || 0;
    const explode = this.ctx.service.coin.explodeCoinPair(symbol);
    const coin1 = explode[0];
    const coin2 = explode[1];
    const coin1Have = balance[coin1] && balance[coin1].free;
    const coin2Have = balance[coin2] && balance[coin2].free;

    if (coin2Have === undefined) return { success: false, message: '本金币持有量不存在' };
    // if (coin2Have < coin2StartLimit) return { success: false, message: '本金币持有量不足脚本启动条件' };

    const per = 1 / symbolLimit.amount.min;
    const unit = Math.ceil(coin2Have * percent / algo.atr * per) / per;
    // if (unit < symbolLimit.amount.min) return { success: false, message: '计算所得开仓单位小于平台最小下单量' };

    const isHoldPosition = coin1Have >= coin1HoldLimit;

    // 开仓点
    const open_point = algo.don_open;
    // 加仓点(在上一次买入（或加仓）的基础上上涨了0.5atr，则加仓一个Unit)
    // 止损点(比最后一次买入价格下跌2atr时，则卖出全部头寸止损)
    // 止盈点(价格跌破二分之一n通道下轨，清仓止盈)

    let winPoint;
    let stopLossPoint;
    let addPoint;
    let lastBuyPrice;
    const addEnd = open_point + 2 * algo.atr;
    if (isHoldPosition) {
      // 止盈
      const winAlgo = await this.algo(platform, symbol, this.ctx.service.coin.timeframeD2(timeframe));
      if (!winAlgo) return { success: false, message: '止盈点algo获取失败' };
      winPoint = winAlgo.don_close;
      lastBuyPrice = await this.ctx.service.apiCcxt.getLastBuyCoin1Price(platform, symbol);
      if (!lastBuyPrice) return { success: false, message: '持仓了, 但最近一条记录不是市价加仓记录' };
      // 止损
      stopLossPoint = lastBuyPrice - 2 * algo.atr;
      // 有持仓，突破1/2atr加1单位
      addPoint = lastBuyPrice + 0.5 * algo.atr;
    }

    return {
      success: true,
      balance,
      algo,
      open_point,
      isHoldPosition,
      lastClosePrice,
      unit,
      addEnd,
      winPoint,
      stopLossPoint,
      addPoint,
      conConfig,
      symbolLimit,
      lastBuyPrice,
    };
  }

  async allAccountAnalysis(pagenum = 1, pagesize = 5) {
    const list = [];
    const accountList = await this.ctx.service.record.findUserConfigs();
    let count = 0;
    if (accountList) {
      for (const account of accountList) {
        const start = pagesize * (pagenum - 1);
        const end = pagesize * pagenum - 1;

        if (count >= start && count <= end) {
          let platform;
          if (account.platform === 'okex') {
            platform = this.ctx.service.apiCcxt.platformOkex({
              apiKey: account.apiKey,
              secret: account.secret,
              password: account.passphrase || undefined,
            });
          }
          if (!platform) {
            list.push({
              success: false,
              message: `配置的平台${account.platform}暂不支持`,
            });
            continue;
          }

          // 延时
          // const start = (new Date()).getTime();
          // const delay = 100;
          // while ((new Date()).getTime() - start < delay) {
          //   continue;
          // }

          const res = await this.ctx.service.haigui.strategyAnalysis(account, platform, account.coinPair);
          if (res) {
            list.push(res);
          }
        }

        count++;
      }
    }
    return { list, count };
  }

}

module.exports = HaiguiService;
