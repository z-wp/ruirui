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
    //       "status": 1
    //   }
    // ]
  }

  async findCoinConfigs(appKey) {
    return await this.app.mysql.select('coin_config', {
      where: { appKey },
    });
  }
}

module.exports = RecordService;
