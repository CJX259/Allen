import { ERROR } from './types/index';

export const PARAMS_ERROR: ERROR = {
  retcode: 10001,
  msg: '参数错误',
};

export const NOT_FOUND: ERROR = {
  retcode: 10002,
  msg: '数据不存在',
};

export const TIME_OUT: ERROR = {
  retcode: 10003,
  msg: '未到指定时间',
};

export const VERIFY_ERROR: ERROR = {
  retcode: 10004,
  msg: '校验错误',
};
