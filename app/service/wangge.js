'use strict';

const Service = require('egg').Service;

class WangGeService extends Service {

  async main() {
    // * 参数 *
    // 最低价、最高价, 最高价需大于等于最低价的1.1倍
    // 进场价（中枢线）
    // 价格间距，等比网格 0.3%-20%
    const unit = 100;
    const apiKey = 'abcd';
    const coin = 'ETH/USDT';
    const price = 48888;
    const list = await this.ctx.service.record.getWangGeRecordList(apiKey, coin);
    let range;
    for (const item of list) {
      if (price > item.low && price < item.high) {
        range = item;
        break;
      }
    }
    if (!range) return { success: true, message: '不在网格区间内' };

    // 所有有买单卖单的成交状态

    if (range.low_status === 0) {
      // 未开买单，开买单
    } else if (range.low_status === 1) {
      // 买单已成交，开卖单，标记状态，记录订单ID
    } else if (range.low_status === 2) {
      // 卖单已成交，开买单
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
      price = price / (1 + width);
      priceList.push(price);
    }
    return priceList;
  }

  async init() {
    const apiKey = 'abcd';
    const coin = 'ETH/USDT';
    const PriceLow = 47500;
    const PriceHigh = 50000;
    const width = 0.006;
    const wangGeList = await this.getWangGeRangeList(PriceLow, PriceHigh, width);
    let sort = 1;
    for (const item of wangGeList) {
      await this.ctx.service.record.addWangGeRecord(apiKey, coin, item.low, item.high, sort);
      sort++;
    }
    return 'ok';
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

  async openBuyOrder() {

  }

  async openSellOrder() {

  }

  async queryOrderStatus() {
    
  }

}

module.exports = WangGeService;
