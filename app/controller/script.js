'use strict';

const Controller = require('egg').Controller;

class ScriptController extends Controller {

  async status() {
    const { ctx } = this;
    const s = ctx.request.query.s || 'h';
    const data = await ctx.service.record.getScriptStatus(s) || {};
    const res = data && data[0];
    if (s === 'w') {
      res.all_time = 5000;
    } else {
      res.all_time = 60000;
    }
    ctx.body = { success: true, data: res };
    // {
    //   "success": true,
    //   "data": [
    //       {
    //           "id": 1,
    //           "name": "core",
    //           "success": 0,
    //           "message": "测试",
    //           "cost_time": 1
    //       }
    //   ]
    // }
  }
}

module.exports = ScriptController;
