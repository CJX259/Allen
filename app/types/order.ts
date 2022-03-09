import { OrderStatus } from '@prisma/client';

export interface NextStepParams {
  id: number, isAuthor: boolean | undefined;
  status: OrderStatus;
  targetNext: boolean | null;
  authorNext: boolean | null;
  opts?: any
};
