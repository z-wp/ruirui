// This file is created by egg-ts-helper@1.25.8
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportAccount = require('../../../app/controller/account');
import ExportData = require('../../../app/controller/data');
import ExportHome = require('../../../app/controller/home');
import ExportLogin = require('../../../app/controller/login');
import ExportScript = require('../../../app/controller/script');

declare module 'egg' {
  interface IController {
    account: ExportAccount;
    data: ExportData;
    home: ExportHome;
    login: ExportLogin;
    script: ExportScript;
  }
}
