import { Role, Status } from "@prisma/client";

// session中存储用户id和name的key值
export const LoginKey = 'USER';
// session中存储验证码的key值
export const CodeKey = 'VER_CODE';
// session中存储注册信息的key值
export const RegisterKey = 'REGISTER_USER';


// 发送验证码倒计时变量
export const CODE_WAITING = 3;

// form表单的各项长度
export const LoginFormSpan = {
  label: 4,
  input: 20,
};

// 请求方法
export const REQ_METHOD = {
  POST: 'POST',
  GET: 'GET',
  PUT: 'PUT',
  DEL: 'DELETE',
};

// remix提供的加载状态(action与loader)
export const LOAD_STATE = {
  idle: 'idle',
  submitting: 'submitting',
  loading: 'loading',
};

// remix提供的更细致加载状态(action与loader)
export const LOAD_TYPE = {
  init: 'init',
  done: 'done',
  actionSubmission: 'actionSubmission',
  loaderSubmission: 'loaderSubmission',
  actionReload: 'actionReload',
  load: 'load',
};

// 升级所需经验值
export const LEVEL_VAR = 2;

export const USER_PAGESIZE = 1;

export const AUDIT_STATUS_MAP = {
  [Status.ALL]: '全部',
  [Status.PENDING]: '待审核',
  [Status.REJECT]: '已下架',
  [Status.RESOLVE]: '已上架',
};

export const ROLE_MAP = {
  [Role.ADMIN]: '管理员',
  [Role.ANCHOR]: '主播',
  [Role.COMPANY]: '供应商',
};

