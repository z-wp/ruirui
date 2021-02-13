'use strict';

const Controller = require('egg').Controller;
const ccxt = require('ccxt');

class HomeController extends Controller {
  async index() {
    const { ctx } = this;

    const okex = new ccxt.okex(this.config.okex);
    // const list = await okex.fetchOHLCV('ETH/USDT', '1d', undefined, 20);

    // const show = list.map(item => {
    //   return {
    //     time: new Date(item.shift()).toLocaleDateString(),
    //     open: item.shift(),
    //     high: item.shift(),
    //     low: item.shift(),
    //     close: item.shift(),
    //   }
    // });

    ctx.body = await okex.fetchTicker('ETH/USDT');
    // ctx.body = await this.ctx.service.apiCcxt.OHLCV('ETH/USDT', '1d');
  }
}

module.exports = HomeController;
