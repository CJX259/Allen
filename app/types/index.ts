export * from './login';
export * from './register';
export interface ERROR {
  msg: string;
  retcode: number;
};

export interface SessionUserData {
  id: number;
  name: string;
};
