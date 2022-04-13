import { OrderStatus } from '@prisma/client';

export interface NextStepParams {
  id: number, isAuthor: boolean | undefined;
  status: OrderStatus;
  targetNext: boolean | null;
  authorNext: boolean | null;
  sysNext: boolean | null;
  opts: OrderOpts;
  targetId: number;
  authorId: number;
};

export type OrderOpts = OrderCheckingOpts & OrderDoingOpts & OrderDoneOpts;

export type OrderDoingOpts = {
  time: number;
  // liveUrl: string;
}

export type OrderCheckingOpts = {
  expressNum: string;
  expressType: string;
  sysExpressNum: string;
  tips?: string;
  [key: string]: any;
};

export type OrderDoneOpts = {
  comment: string;
  rating: number;
  fromId: number;
  toId: number;
};
