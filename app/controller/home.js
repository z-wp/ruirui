'use strict';

const Controller = require('egg').Controller;
const ccxt = require('ccxt');

class HomeController extends Controller {
  async index() {
    const { ctx } = this;

    const okex = new ccxt.okex({
      apiKey: '22ce605a-309b-43c8-a455-f9acde887113',
      secret: 'E69A9A2EAA14BF5A0DC4C4AE21D87C7C',
    });
    const list = await okex.fetchOHLCV('ETH/USDT', '1d');

    const show = list.map(item => {
      return {
        time: new Date(item.shift()).toDateString('Y-m-d H:i:s'),
        open: item.shift(),
        high: item.shift(),
        low: item.shift(),
        close: item.shift(),
      }
    });
    ctx.body = show;
  }
}

module.exports = HomeController;
