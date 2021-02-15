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
      port: 80,
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
  };

  config.okex = {
    apiKey: '54b27c1a-05ed-4936-b4b5-f92b9f82f40f',
    secret: 'EB7459716CCE1B19C8FAFABC419A1CEA',
    password: 'Xiaowei719899730',
  };

  return {
    ...config,
    ...userConfig,
  };
};
