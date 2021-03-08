// This file is created by egg-ts-helper@1.25.8
// Do not modify this file!!!!!!!!!

import 'egg';
type AnyClass = new (...args: any[]) => any;
type AnyFunc<T = any> = (...args: any[]) => T;
type CanExportFunc = AnyFunc<Promise<any>> | AnyFunc<IterableIterator<any>>;
type AutoInstanceType<T, U = T extends CanExportFunc ? T : T extends AnyFunc ? ReturnType<T> : T> = U extends AnyClass ? InstanceType<U> : U;
import ExportApiCcxt = require('../../../app/service/apiCcxt');
import ExportCoin = require('../../../app/service/coin');
import ExportHaigui = require('../../../app/service/haigui');
import ExportRecord = require('../../../app/service/record');
import ExportWangge = require('../../../app/service/wangge');

declare module 'egg' {
  interface IService {
    apiCcxt: AutoInstanceType<typeof ExportApiCcxt>;
    coin: AutoInstanceType<typeof ExportCoin>;
    haigui: AutoInstanceType<typeof ExportHaigui>;
    record: AutoInstanceType<typeof ExportRecord>;
    wangge: AutoInstanceType<typeof ExportWangge>;
  }
}
