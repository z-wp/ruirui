'use strict';

const Controller = require('egg').Controller;

class DataController extends Controller {

  async strategy() {
    const { ctx } = this;
    const res = await this.ctx.service.haigui.allAccountAnalysis();
    ctx.body = res;
  }
}

module.exports = DataController;
