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
}

module.exports = RecordService;
