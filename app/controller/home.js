'use strict';

const Controller = require('egg').Controller;
const ccxt = require('ccxt');

class HomeController extends Controller {
  async index() {
    const { ctx } = this;

    const okex = new ccxt.okex();
    ctx.body = await okex.loadMarkets();

  }
}

module.exports = HomeController;
