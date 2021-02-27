'use strict';

const Service = require('egg').Service;

class RecordService extends Service {

  async test() {
    // const data = await this.app.mysql.get('trade', { id: 1 });
    // const data = await this.app.mysql.insert('trade', { coin: 'ETH/USDT', action: 1, price: 50001.1, quantity: 0.56, user: '54b27c1a' });
    const data = await this.app.mysql.select('trade', {
      where: { user: '54b27c1a', coin: 'ETH/USDT' },
      orders: [[ 'timestamp', 'desc' ]],
      limit: 2,
    });
    return data;
  }

  async findUserConfigs() {
    return await this.app.mysql.select('account', {});
    // [
    //   {
    //       "id": 1,
    //       "apiKey": "54b27c1a-05ed-4936-b4b5-f92b9f82f40f",
    //       "secret": "EB7459716CCE1B19C8FAFABC419A1CEA",
    //       "passphrase": "Xiaowei719899730",
    //       "status": 1,
    //       "platform": "okex",
    //       "coinPair": "ETH/USDT",
    //       "coin2JoinQuantity": 100,
    //       "coin1JoinQuantity": 0.01
    //   }
    // ]
  }

  async findCoinConfigs(appKey) {
    return await this.app.mysql.select('coin_config', {
      where: { appKey },
    });
  }

  async changeAccountState(id, state) {
    return await this.app.mysql.update('account', {
      id,
      state,
    });
  }

  async addAccount(data) {
    return await this.app.mysql.insert('account', data);
  }

  async findAccount(id) {
    return await this.app.mysql.select('account', {
      where: { id },
    });
  }

  async editAccount(data) {
    return await this.app.mysql.update('account', data);
  }

  async updateScriptStatus(success, message, costTime) {
    return await this.app.mysql.update('script', {
      id: 1,
      success: success ? 1 : 0,
      message,
      cost_time: costTime,
    });
  }

  async getScriptStatus() {
    return await this.app.mysql.select('script', {
      where: { id: 1 },
    });
  }
}

module.exports = RecordService;
