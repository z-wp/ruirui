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
    ctx.body = await okex.fetchTrades('ETH/USDT');

  }
}

module.exports = HomeController;
