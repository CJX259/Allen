import { OrderStatus } from '@prisma/client';

export interface NextStepParams {
  id: number, isAuthor: boolean | undefined;
  status: OrderStatus;
  targetNext: boolean | null;
  authorNext: boolean | null;
  opts?: OrderOpts;
};

export type OrderOpts = OrderCheckingOpts & OrderDoingOpts;

export type OrderDoingOpts = {
  times: number;
  time: string;
  liveUrl: string;
}

export type OrderCheckingOpts = {
  expressNum: string;
  expressType: string;
  tips?: string;
  [key: string]: any;
};
