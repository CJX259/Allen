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
  msg: '参数校验错误',
};

export const DB_ERROR: ERROR = {
  retcode: 10005,
  msg: '数据库操作错误',
};

export const DB_ROW_REPEAT: ERROR = {
  retcode: 10006,
  msg: '表中存在数据重复',
};

export const USER_ERROR: ERROR = {
  retcode: 10007,
  msg: '账号或密码错误',
};

export const NO_PERMISSION: ERROR = {
  retcode: 10008,
  msg: '账号没有权限',
};
