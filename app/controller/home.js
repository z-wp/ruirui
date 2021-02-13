'use strict';

const Controller = require('egg').Controller;
const ccxt = require('ccxt');

class HomeController extends Controller {
  async index() {
    const { ctx } = this;

    const huobi = new ccxt.huobipro();
    ctx.body = await huobi.fetchMarket('ETH/USDT');

  }
}

module.exports = HomeController;
