'use strict';

const Subscription = require('egg').Subscription;

class UpdateRunTime extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      // interval: '1m',
      cron: '0 0 23 * * *',
      type: 'worker',
    };
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    await this.ctx.service.record.recordAccountMoney();
  }
}

module.exports = UpdateRunTime;
