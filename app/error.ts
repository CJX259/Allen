import { ERROR } from './types/index';

export const PARAMS_ERROR: ERROR = {
  retcode: 10001,
  msg: '参数错误',
};

export const NOT_FOUND: ERROR = {
  retcode: 10002,
  msg: '数据不存在',
};
