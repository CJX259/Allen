/* eslint-disable no-unused-vars */
export enum LOGIN_METHOD {
  CODE = 1,
  PASSWORD,
};

export interface CodeData {
  phone: string;
  code: string;
  sendTime: number;
};
