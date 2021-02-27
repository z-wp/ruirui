'use strict';

const Controller = require('egg').Controller;

class LoginController extends Controller {

  async login() {
    const { ctx } = this;
    const username = ctx.request.body.username;
    const password = ctx.request.body.password;
    const data = { token: escape(username + password) };
    if (username === 'admin' && password === '2021@ruirui') {
      ctx.body = { success: true, data };
    } else {
      ctx.body = { success: false };
    }
  }
}

module.exports = LoginController;
