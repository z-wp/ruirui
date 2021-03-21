/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  config.cluster = {
    listen: {
      path: '',
      port: 7001,
      hostname: '0.0.0.0',
    },
  };

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1613133696919_8769';

  // add your middleware config here
  config.middleware = [];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
    security: {
      csrf: {
        enable: false,
      },
      domainWhiteList: [ 'manga.wang', '*' ],
    },
    cors: {
      origin: '*',
      allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
    },
  };

  config.okex = {
    apiKey: '54b27c1a-05ed-4936-b4b5-f92b9f82f40f',
    secret: 'EB7459716CCE1B19C8FAFABC419A1CEA',
    password: 'Xiaowei719899730',
  };

  config.binance = {
    apiKey: '5nvjwG1sMbJHm6tl4JKiqu5q1Bx72Ggm3W5kdwxbpP1YeShMVoVsy0QrRCwVjdyB',
    secret: 'ndSwWBxZdE5yTaTd7ERFpAqVLFClOelXJ7wYGQnQlXnLF3PjYX031L1zNQOJHbmM',
  };

  config.huobi = {
    apiKey: '3f83a4c5-d393af11-4ebbc5cb-vfd5ghr532',
    secret: 'ab321e7b-81a5f593-8a0f91ba-dd8bc',
  };

  config.mysql = {
    // 单数据库信息配置
    client: {
      // host
      host: '127.0.0.1',
      // 端口号
      port: '3306',
      // 用户名
      user: 'root',
      // 密码
      password: 'root', // w+Wwa7vp6=l8
      // 数据库名
      database: 'record',
    },
    // 是否加载到 app 上，默认开启
    app: true,
    // 是否加载到 agent 上，默认关闭
    agent: false,
  };

  return {
    ...config,
    ...userConfig,
  };
};
