'use strict';

const Controller = require('egg').Controller;
const ccxt = require('ccxt');

class HomeController extends Controller {
  async index() {
    const { ctx } = this;

    const platform = this.ctx.service.apiCcxt.platformOkex(this.config.okex);
    ctx.body = await this.ctx.service.haigui.algo(platform, 'ETH/USDT') || 'not data';
    // ctx.body = await this.ctx.service.apiCcxt.getLastBuyCoin1Price(platform, 'ETH/USDT');
    // ctx.body = await this.ctx.service.haigui.spotStrategy(platform, 'ETH/USDT');

    // const data = await ctx.service.record.findCoinConfigs('54b27c1a-05ed-4936-b4b5-f92b9f82f40f');
    // const data = await ctx.service.record.findUserConfigs();

    // const data = await ctx.service.haigui.main();
    // ctx.body = data;

    // const okex = new ccxt.okex(this.config.okex);
    // const data = await okex.fetchOrdersByState(2, 'ETH/USDT', undefined, 10); // type是limit还是market
    // const list = await okex.fetchOHLCV('ETH/USDT', '1d', undefined, 20);
    // const data = (await okex.fetchMarkets()).filter(item => item.type === 'spot' && item.symbol === 'ETH/USDT').shift();
    // const data = await okex.createOrder('ETH/USDT', 'market', 'buy', 0.002, 1518.01);
    // const data = await okex.createOrder('ETH/USDT', 'market', 'sell', 0.0019);
    // ctx.body = data;

    // const show = list.map(item => {
    //   return {
    //     time: new Date(item.shift()).toLocaleDateString(),
    //     open: item.shift(),
    //     high: item.shift(),
    //     low: item.shift(),
    //     close: item.shift(),
    //   }
    // });

    // ctx.body = await okex.fetchTicker('ETH/USDT');
    // {"symbol":"ETH/USDT","timestamp":1613232225815,"datetime":"2021-02-13T16:03:45.815Z","high":1871.29,"low":1764.91,"bid":1813.7,"bidVolume":31.3,"ask":1813.71,"askVolume":0.028,"open":1795.79,"close":1813.7,"last":1813.7,"baseVolume":124191.189045,"quoteVolume":226653234.96,"info":{"best_ask":"1813.71","best_bid":"1813.7","instrument_id":"ETH-USDT","open_utc0":"1840.14","open_utc8":"1815.9","product_id":"ETH-USDT","last":"1813.7","last_qty":"0.77145","ask":"1813.71","best_ask_size":"0.028","bid":"1813.7","best_bid_size":"31.3","open_24h":"1795.79","high_24h":"1871.29","low_24h":"1764.91","base_volume_24h":"124191.189045","timestamp":"2021-02-13T16:03:45.815Z","quote_volume_24h":"226653234.96"}}

    // ctx.body = await this.ctx.service.apiCcxt.OHLCV('ETH/USDT', '1d');
    // ctx.body = await this.ctx.service.haigui.algo('ETH/USDT');
    // const data = await okex.fetchOHLCV('ETH/USDT', '1m', undefined, 1);
    // ctx.body = {
    //   data,
    //   close: data[0][4],
    // };
    // ctx.body = await this.ctx.service.apiCcxt.lastClosePrice(platform, 'ETH/USDT');
    // ctx.body = await this.ctx.service.haigui.unit('ETH/USDT');
    // ctx.body = await okex.fetchBalance({ type: 'spot' });
    // ctx.body = await this.ctx.service.haigui.unit('ETH/USDT');
  }
}

module.exports = HomeController;
