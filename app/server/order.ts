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

// 获取用户直播信息（仅包括直播中状态的）
export async function getLiveData(userId: number) {
  const orders = await db.order.findMany({
    where: {
      OR: [
        {
          targetId: userId,
        },
        {
          authorId: userId,
        },
      ],
      status: OrderStatus.DOING,
    },
    include: {
      target: {
        select: {
          name: true,
          id: true,
          role: true,
        },
      },
      author: {
        select: {
          name: true,
          id: true,
          role: true,
        },
      },
    },
  });
  // order增加Role.xxx，在这里进行判断
  return orders;
};
