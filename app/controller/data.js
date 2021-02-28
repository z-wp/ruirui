'use strict';

const Controller = require('egg').Controller;

class DataController extends Controller {

  async strategy() {
    return await this.ctx.service.haigui.allAccountAnalysis();
  }
}

module.exports = DataController;
