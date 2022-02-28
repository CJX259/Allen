
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
