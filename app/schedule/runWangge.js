'use strict';

const Subscription = require('egg').Subscription;

class RunWangGe extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      interval: '5s',
      type: 'worker',
    };
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    const startTime = (new Date()).getTime();
    const res = await this.ctx.service.wangge.test();

    if (res) {
      const endTime = (new Date()).getTime();
      await this.ctx.service.record.updateScriptStatus(res.success, res.message, endTime - startTime, 2);
    }
  }
}

module.exports = RunWangGe;
