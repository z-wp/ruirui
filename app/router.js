'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.post('/api/login', controller.login.login);
  router.get('/api/accounts', controller.account.accounts);
  router.post('/api/account/changeState', controller.account.changeState);
  router.post('/api/account/add', controller.account.add);
  router.post('/api/account/query', controller.account.query);
  router.post('/api/account/edit', controller.account.edit);
  router.get('/api/script/status', controller.script.status);
};
