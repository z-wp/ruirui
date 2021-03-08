'use strict';

const Controller = require('egg').Controller;
const ccxt = require('ccxt');

class HomeController extends Controller {
  async index() {
    const { ctx } = this;

    const platform = this.ctx.service.apiCcxt.platformBinance(this.config.binance);
    const symbol = 'ETH/USDT';
    const timeframe = '1h';
    const percent = 0.01;
    // await this.ctx.service.record.recordAccountMoney();
    const [ balance, symbolLimit, lastClosePrice ] = await Promise.all([
      this.ctx.service.apiCcxt.spot(platform),
      this.ctx.service.apiCcxt.marketLimitBySymbol(platform, symbol), // {"amount":{"min":0.001},"price":{"min":0.01},"cost":{"min":0.01}}
      this.ctx.service.apiCcxt.lastClosePrice(platform, symbol),
    ]);
    const algo = await this.algo(platform, symbol, timeframe);
    const explode = this.ctx.service.coin.explodeCoinPair(symbol);
    const coin2 = explode[1];
    const coin2Have = balance[coin2] && balance[coin2].free;
    const per = 1 / symbolLimit.amount.min;
    const unit = Math.ceil(coin2Have * percent / algo.atr * per) / per;
    const res = await this.addStore(platform, symbol, unit, lastClosePrice);
    ctx.body = res;
    // const algo = await this.ctx.service.haigui.algo(platform, symbol, timeframe);
    // ctx.body = { algo };
    // const percent = 0.01;
    // const [ balance, algo, symbolLimit, lastClosePrice ] = await Promise.all([
    //   this.ctx.service.apiCcxt.spot(platform),
    //   this.ctx.service.haigui.algo(platform, symbol, timeframe),
    //   this.ctx.service.apiCcxt.marketLimitBySymbol(platform, symbol), // {"amount":{"min":0.001},"price":{"min":0.01},"cost":{"min":0.01}}
    //   this.ctx.service.apiCcxt.lastClosePrice(platform, symbol),
    // ]);
    // const explode = this.ctx.service.coin.explodeCoinPair(symbol);
    // const coin2 = explode[1];
    // const coin2Have = balance[coin2] && balance[coin2].free;

    // const per = 1 / symbolLimit.amount.min;
    // const unit = Math.ceil(coin2Have * percent / algo.atr * per) / per;
    // const res = await this.ctx.service.haigui.addStore(platform, symbol, unit, lastClosePrice);
    // ctx.body = { res };
    // ctx.body = await this.ctx.service.apiCcxt.marketLimitBySymbol(platform, 'ETH/USDT');
    // const price = await this.ctx.service.apiCcxt.lastClosePrice(platform, 'ETH/USDT');
    // const balance = await this.ctx.service.apiCcxt.spot(platform);
    // const eth = balance['ETH'] && balance['ETH'].free;
    // const res = await this.ctx.service.haigui.clearStore(platform, 'ETH/USDT', eth);
    // ctx.body = { a: 1, res };

    // const data = await this.ctx.service.record.moneyChangeList();
    // ctx.body = data;

    // const data = this.ctx.service.coin.explodeCoinPair('ETH/USDT');
    // const data = await this.ctx.service.haigui.allAccountAnalysis();
    // ctx.body = data;
    // const platform = this.ctx.service.apiCcxt.platformOkex(this.config.okex);
    // const list = await platform.fetchOrdersByState(2, 'ETH/USDT', undefined, 10) || [];
    // ctx.body = { data: list, a: 'a' };
    // ctx.body = await this.ctx.service.haigui.algo(platform, 'ETH/USDT') || 'not data';
    // ctx.body = await this.ctx.service.apiCcxt.getLastBuyCoin1Price(platform, 'ETH/USDT');
    // ctx.body = await this.ctx.service.haigui.spotStrategy(platform, 'ETH/USDT');

    // const data = await ctx.service.record.findCoinConfigs('54b27c1a-05ed-4936-b4b5-f92b9f82f40f');
    // const data = await ctx.service.record.findUserConfigs();

    // const data = await ctx.service.haigui.main();
    // ctx.body = data;

    // const okex = new ccxt.okex(this.config.okex);
    // const data = await okex.fetchTicker('ETH/USDT');
    // const data = await okex.fetchTickersByType('spot', [ 'BTC/USDT', 'ETH/USDT', 'EOS/USDT' ]);
    // const data = await this.ctx.service.apiCcxt.spotAccountUSDT(platform);
    // ctx.body = data;
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
