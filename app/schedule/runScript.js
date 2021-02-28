'use strict';

module.exports = {
  schedule: {
    interval: '30s', // 间隔
    type: 'worker', // worker每台机器上只有一个 worker 会执行这个定时任务; all指定所有的 worker 都需要执行
  },
  async task(ctx) {

    const startTime = (new Date()).getTime();
    const res = await ctx.service.haigui.main();

    // test-start
    // const start = (new Date()).getTime();
    // const delay = 1000;
    // while ((new Date()).getTime() - start < delay) {
    //   continue;
    // }
    // const res = { success: true, message: '' };
    // test-end

    if (res) {
      const endTime = (new Date()).getTime();
      await ctx.service.record.updateScriptStatus(res.success, res.message, endTime - startTime);
    }

  },
};
