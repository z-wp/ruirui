'use strict';

const Controller = require('egg').Controller;

class DataController extends Controller {

  async strategy() {
    const { ctx } = this;
    const pagenum = ctx.request.query.pagenum || 1;
    const { list: data, count: total } = await this.ctx.service.haigui.allAccountAnalysis(pagenum);
    ctx.body = { success: true, data, total };
  }

  async accountUsdt() {
    const { ctx } = this;
    const data = await this.ctx.service.record.moneyChangeList();
    ctx.body = { success: true, data };
  }
}

module.exports = DataController;
