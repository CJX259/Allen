import { Role } from '@prisma/client';

export * from './login';
export * from './register';
export * from './menu';
export * from './loaderData';
export * from './search';
export * from './order';
export interface ERROR {
  msg: string;
  retcode: number;
};

export interface SessionUserData {
  id: number;
  role: Role;
};

export interface SUCCESS {
  success: boolean;
  [key: string]: any;
};
