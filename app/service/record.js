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

  async distinctAccount() {
    return await this.app.mysql.query('select distinct apiKey from account');
  }

  async updateScriptStatus(success, message, costTime) {
    let data;
    if (message !== '') {
      data = {
        id: 1,
        success: success ? 1 : 0,
        message,
        cost_time: costTime,
      };
    } else {
      data = {
        id: 1,
        success: success ? 1 : 0,
        cost_time: costTime,
      };
    }
    return await this.app.mysql.update('script', data);
  }

  async getScriptStatus() {
    return await this.app.mysql.select('script', {
      where: { id: 1 },
    });
  }

  async addMoneyRecord(account, usdt) {
    const timestamp = (new Date()).getTime();
    const data = {
      account,
      usdt,
      timestamp,
    };
    return await this.app.mysql.insert('money', data);
  }

  async findAllMoneyRecord() {
    return await this.app.mysql.select('money', {});
  }

  async recordAccountMoney() {
    const accountList = await this.ctx.service.record.findUserConfigs();
    if (accountList) {
      const apiKeyList = [];
      for (const account of accountList) {
        if (!apiKeyList.includes(account.apiKey)) {
          let platform;
          if (account.platform === 'okex') {
            platform = this.ctx.service.apiCcxt.platformOkex({
              apiKey: account.apiKey,
              secret: account.secret,
              password: account.passphrase || undefined,
            });
          }
          if (!platform) {
            continue;
          }
          const usdt = await this.ctx.service.apiCcxt.spotAccountUSDT(platform);
          await this.addMoneyRecord(account.apiKey, usdt);

          apiKeyList.push(account.apiKey);
        }
      }
    }
  }

  async moneyChangeList() {
    const map = new Map();
    const records = await this.findAllMoneyRecord();
    for (const record of records) {
      const time = new Date(record.timestamp).toJSON().replace(/T.*/, '');
      const account = record.account;
      if (map.get(account)) {
        const data = map.get(account);
        data.usdt.push(record.usdt);
        data.time.push(time);
        map.set(account, data);
      } else {
        map.set(account, {
          usdt: [ record.usdt ],
          time: [ time ],
        });
      }
    }
    const obj = Object.create(null);
    for (const [ k, v ] of map) {
      obj[k] = v;
    }
    return obj;
  }
}

module.exports = RecordService;
