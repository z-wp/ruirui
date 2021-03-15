'use strict';

const Service = require('egg').Service;

class WangGeService extends Service {

  async test() {
    // 延时
    const start = (new Date()).getTime();
    const delay = 1000;
    while ((new Date()).getTime() - start < delay) {
      continue;
    }
    return { success: true, message: '调试中' };
  }

  async main() {
    // return { success: false, message: '测试' };
    try {
      const accountList = await this.ctx.service.record.findWangGeUserConfigs();
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
            } else if (account.platform === 'binance') {
              platform = this.ctx.service.apiCcxt.platformBinance({
                apiKey: account.apiKey,
                secret: account.secret,
              });
            }
            if (!platform) {
              return { success: false, message: `配置的平台${account.platform}暂不支持` };
            }

            const res = await this.ctx.service.wangge.runWangGe(platform, account);
            if (res && !res.success) {
              return { success: false, message: res.message };
            }
          }
        }
      }

      return { success: true, message: 'ok' };
    } catch (error) {
      this.ctx.logger.error(error.message);
      return { success: false, message: error.message };
    }
  }

  async runWangGe(platform, config) {
    // * 参数 *
    // 最低价、最高价, 最高价需大于等于最低价的1.1倍
    // 进场价（中枢线）
    // 价格间距，等比网格 0.3%-20%
    const amount = config.amount;
    const apiKey = config.apiKey;
    const coin = config.coin;
    const price = await this.ctx.service.apiCcxt.lastClosePrice(platform, coin);
    if (!price) {
      return { success: false, message: `${coin}价格获取失败` };
    }
    const list = await this.ctx.service.record.getWangGeRecordList(apiKey, coin);
    for (const item of list) {
      // low_status: 0-未开; 1-开了未成交；2-已成交
      // 一直查持有的订单状态
      if (item.low_status === 0) {
        if (price > item.low) {
          const buyId = await this.openBuyOrder(platform, coin, amount, item.low);
          if (buyId) {
            item.low_status = 1;
            item.low_order_id = buyId;
            await this.ctx.service.record.saveWangGeRecord(item);
          }
        }
      } else if (item.low_status === 1 && item.low_order_id) {
        const buy = await this.queryOrderStatus(platform, item.low_order_id, item.coin);
        if (buy && buy.status) {
          if (buy.status === 'canceled') {
            item.low_status = 0;
            item.low_order_id = null;
            await this.ctx.service.record.saveWangGeRecord(item);
          } else if (buy.status === 'closed') {
            item.low_status = 2;
            await this.ctx.service.record.saveWangGeRecord(item);
          }
        }
      } else if (item.low_status === 2 && item.high_status === 0) {
        let sellPrice = item.high;
        if (price > sellPrice) {
          sellPrice = price;
        }
        const sellId = await this.openSellOrder(platform, coin, amount, sellPrice);
        if (sellId) {
          item.high_status = 1;
          item.high_order_id = sellId;
          await this.ctx.service.record.saveWangGeRecord(item);
        }
      } else if (item.high_status === 1) {
        const sell = await this.queryOrderStatus(platform, item.high_order_id, item.coin);
        if (sell && sell.status) {
          if (sell.status === 'canceled') {
            item.high_status = 0;
            item.high_order_id = null;
            await this.ctx.service.record.saveWangGeRecord(item);
          } else if (sell.status === 'closed') {
            item.high_status = 2;
            await this.ctx.service.record.saveWangGeRecord(item);
          }
        }
      } else if (item.high_status === 2) {
        item.low_status = 0;
        item.low_order_id = null;
        item.high_status = 0;
        item.low_order_id = null;
        await this.ctx.service.record.saveWangGeRecord(item);
      }
      return { success: true, message: '' };
    }

    return { success: true, message: '' };
  }

  async getWangGeRangeList(PriceLow, PriceHigh, width) {
    const list = await this.getWangGePriceList(PriceLow, PriceHigh, width);
    let p;
    const rangList = [];
    for (const price of list) {
      if (p) {
        rangList.push({ low: price, high: p });
        p = price;
      } else {
        p = price;
      }
    }
    return rangList;
  }

  async getWangGePriceList(PriceLow, PriceHigh, width) {
    const priceList = [];
    let price = PriceHigh;
    while (price > PriceLow) {
      priceList.push(price);
      price = price / (1 + width);
    }
    return priceList;
  }

  async init(config) {
    const apiKey = config.apiKey;
    const coin = config.coin;
    const PriceLow = config.low;
    const PriceHigh = config.high;
    const width = config.width;

    await this.ctx.service.record.deleteWangGeByAccount(config);

    const wangGeList = await this.getWangGeRangeList(PriceLow, PriceHigh, width);
    let sort = 1;
    for (const item of wangGeList) {
      await this.ctx.service.record.addWangGeRecord(apiKey, coin, item.low, item.high, sort);
      sort++;
    }
    return true;
  }

  async getAtRange(apiKey, coin, price) {
    const list = await this.ctx.service.record.getWangGeRecordList(apiKey, coin);
    for (const item of list) {
      if (price > item.low && price < item.high) {
        return item;
      }
    }
    return null;
  //   {
  //     "id": 3,
  //     "apiKey": "abcd",
  //     "coin": "ETH/USDT",
  //     "low": 48817.786246421485,
  //     "high": 49110.692963900015,
  //     "low_status": 0,
  //     "low_order_id": null,
  //     "high_status": 0,
  //     "high_order_id": null,
  //     "status": 0,
  //     "sort": 3
  // }
  }

  async openBuyOrder(platform, symbol, amount, price) {
    const res = await platform.createOrder(symbol, 'LIMIT', 'buy', amount, price);
    return res && res.id || null;
    // {
    //   "info":{
    //       "symbol":"ETHUSDT",
    //       "orderId":3304279342,
    //       "orderListId":-1,
    //       "clientOrderId":"x-R4BD3S82bebfaf16333b4aaba2e32b",
    //       "transactTime":1615369063815,
    //       "price":"1600.00000000",
    //       "origQty":"0.10000000",
    //       "executedQty":"0.00000000",
    //       "cummulativeQuoteQty":"0.00000000",
    //       "status":"NEW",
    //       "timeInForce":"GTC",
    //       "type":"LIMIT",
    //       "side":"BUY"
    //   },
    //   "id":"3304279342",
    //   "clientOrderId":"x-R4BD3S82bebfaf16333b4aaba2e32b",
    //   "timestamp":1615369063815,
    //   "datetime":"2021-03-10T09:37:43.815Z",
    //   "symbol":"ETH/USDT",
    //   "type":"limit",
    //   "timeInForce":"GTC",
    //   "postOnly":false,
    //   "side":"buy",
    //   "price":1600,
    //   "amount":0.1,
    //   "cost":0,
    //   "filled":0,
    //   "remaining":0.1,
    //   "status":"open"
    // }
  }

  async openSellOrder(platform, symbol, amount, price) {
    const res = await platform.createOrder(symbol, 'LIMIT', 'sell', amount, price);
    return res && res.id || null;
    //   {
    //     "info":{
    //         "symbol":"ETHUSDT",
    //         "orderId":3304696201,
    //         "orderListId":-1,
    //         "clientOrderId":"x-R4BD3S82d12990dd7d0e4c2798c3e1",
    //         "transactTime":1615372545438,
    //         "price":"2500.00000000",
    //         "origQty":"0.10000000",
    //         "executedQty":"0.00000000",
    //         "cummulativeQuoteQty":"0.00000000",
    //         "status":"NEW",
    //         "timeInForce":"GTC",
    //         "type":"LIMIT",
    //         "side":"SELL"
    //     },
    //     "id":"3304696201",
    //     "clientOrderId":"x-R4BD3S82d12990dd7d0e4c2798c3e1",
    //     "timestamp":1615372545438,
    //     "datetime":"2021-03-10T10:35:45.438Z",
    //     "symbol":"ETH/USDT",
    //     "type":"limit",
    //     "timeInForce":"GTC",
    //     "postOnly":false,
    //     "side":"sell",
    //     "price":2500,
    //     "amount":0.1,
    //     "cost":0,
    //     "filled":0,
    //     "remaining":0.1,
    //     "status":"open"
    // }

    //   {
    //     "info":{
    //         "symbol":"ETHUSDT",
    //         "orderId":3305945041,
    //         "orderListId":-1,
    //         "clientOrderId":"x-R4BD3S82ff970d4709624313a893ae",
    //         "transactTime":1615382434007,
    //         "price":"1831.00000000",
    //         "origQty":"0.01000000",
    //         "executedQty":"0.01000000",
    //         "cummulativeQuoteQty":"18.31750000",
    //         "status":"FILLED",
    //         "timeInForce":"GTC",
    //         "type":"LIMIT",
    //         "side":"SELL"
    //     },
    //     "id":"3305945041",
    //     "clientOrderId":"x-R4BD3S82ff970d4709624313a893ae",
    //     "timestamp":1615382434007,
    //     "datetime":"2021-03-10T13:20:34.007Z",
    //     "symbol":"ETH/USDT",
    //     "type":"limit",
    //     "timeInForce":"GTC",
    //     "postOnly":false,
    //     "side":"sell",
    //     "price":1831,
    //     "amount":0.01,
    //     "cost":18.3175,
    //     "average":1831.7499999999998,
    //     "filled":0.01,
    //     "remaining":0,
    //     "status":"closed"
    // }
  }

  async queryOrderStatus(platform, orderId, symbol) {
    const res = await platform.fetchOrder(orderId, symbol);
    return res || null;
    //   {
    //     "info":{
    //         "symbol":"ETHUSDT",
    //         "orderId":3304279342,
    //         "orderListId":-1,
    //         "clientOrderId":"x-R4BD3S82bebfaf16333b4aaba2e32b",
    //         "price":"1600.00000000",
    //         "origQty":"0.10000000",
    //         "executedQty":"0.00000000",
    //         "cummulativeQuoteQty":"0.00000000",
    //         "status":"CANCELED",
    //         "timeInForce":"GTC",
    //         "type":"LIMIT",
    //         "side":"BUY",
    //         "stopPrice":"0.00000000",
    //         "icebergQty":"0.00000000",
    //         "time":1615369063815,
    //         "updateTime":1615369275420,
    //         "isWorking":true,
    //         "origQuoteOrderQty":"0.00000000"
    //     },
    //     "id":"3304279342",
    //     "clientOrderId":"x-R4BD3S82bebfaf16333b4aaba2e32b",
    //     "timestamp":1615369063815,
    //     "datetime":"2021-03-10T09:37:43.815Z",
    //     "symbol":"ETH/USDT",
    //     "type":"limit",
    //     "timeInForce":"GTC",
    //     "postOnly":false,
    //     "side":"buy",
    //     "price":1600,
    //     "stopPrice":0,
    //     "amount":0.1,
    //     "cost":0,
    //     "filled":0,
    //     "remaining":0.1,
    //     "status":"canceled" // 取消
    // }

  //   {
  //     "info":{
  //         "symbol":"ETHUSDT",
  //         "orderId":3305945041,
  //         "orderListId":-1,
  //         "clientOrderId":"x-R4BD3S82ff970d4709624313a893ae",
  //         "price":"1831.00000000",
  //         "origQty":"0.01000000",
  //         "executedQty":"0.01000000",
  //         "cummulativeQuoteQty":"18.31750000",
  //         "status":"FILLED",
  //         "timeInForce":"GTC",
  //         "type":"LIMIT",
  //         "side":"SELL",
  //         "stopPrice":"0.00000000",
  //         "icebergQty":"0.00000000",
  //         "time":1615382434007,
  //         "updateTime":1615382434007,
  //         "isWorking":true,
  //         "origQuoteOrderQty":"0.00000000"
  //     },
  //     "id":"3305945041",
  //     "clientOrderId":"x-R4BD3S82ff970d4709624313a893ae",
  //     "timestamp":1615382434007,
  //     "datetime":"2021-03-10T13:20:34.007Z",
  //     "symbol":"ETH/USDT",
  //     "type":"limit",
  //     "timeInForce":"GTC",
  //     "postOnly":false,
  //     "side":"sell",
  //     "price":1831,
  //     "stopPrice":0,
  //     "amount":0.01,
  //     "cost":18.3175,
  //     "average":1831.7499999999998,
  //     "filled":0.01,
  //     "remaining":0,
  //     "status":"closed" // 完成
  // }
  }

}

module.exports = WangGeService;
