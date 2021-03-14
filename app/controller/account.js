'use strict';

const Controller = require('egg').Controller;

class AccountController extends Controller {

  async accounts() {
    const { ctx } = this;
    const strategy = ctx.request.query.s || 'haigui';
    const list = await ctx.service.record.findUserConfigs(strategy) || [];
    ctx.body = { success: true, data: list };
  }

  async changeState() {
    const { ctx } = this;
    const id = ctx.request.body.id;
    const strategy = ctx.request.body.s || 'haigui';
    const state = ctx.request.body.state;
    const res = await ctx.service.record.changeAccountState(parseInt(id), parseInt(state), strategy);
    ctx.body = { success: !!res };
  }

  async add() {
    const { ctx } = this;
    const body = ctx.request.body;
    const strategy = ctx.request.body.s || 'haigui';
    delete body.s;
    const res = await ctx.service.record.addAccount(body, strategy);
    ctx.body = { success: !!res };
  }

  async query() {
    const { ctx } = this;
    const id = ctx.request.body.id;
    const strategy = ctx.request.body.s || 'haigui';
    const res = await ctx.service.record.findAccount(id, strategy);
    if (!res || !res[0]) {
      ctx.body = { success: false };
    } else {
      ctx.body = { success: true, data: res[0] };
    }
  }

  async edit() {
    const { ctx } = this;
    const body = ctx.request.body;
    const strategy = ctx.request.body.s || 'haigui';
    delete body.s;
    const res = await ctx.service.record.editAccount(body, strategy);
    ctx.body = { success: !!res };
  }

  async wanggeList() {
    const { ctx } = this;
    const body = ctx.request.body;
    const list = await ctx.service.wangge.getWangGeRangeList(body.low, body.high, body.width);
    const platform = this.ctx.service.apiCcxt.platformBinance({ apiKey: body.apiKey, secret: body.secret });
    const count = list.length;
    const own = await ctx.service.apiCcxt.spot(platform);
    ctx.body = { success: true, data: { list, count, own } };
  }
}

module.exports = AccountController;
