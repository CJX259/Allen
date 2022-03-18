import { OrderStatus } from '@prisma/client';
import { db } from '~/utils/db.server';


/**
 * 计算某用户的签约总数
 *
 * @param {number} userId
 * @return {*}
 */
export async function calcOrderCount(userId: number) {
  return await db.order.count({
    where: {
      OR: [
        {
          authorId: userId,
        },
        {
          targetId: userId,
        },
      ],
      status: {
        not: OrderStatus.REJECTED,
      },
    },
  });
};
