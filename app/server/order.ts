import { OrderStatus } from '@prisma/client';
import moment from 'moment';
import { db } from '~/utils/db.server';

export interface SearchParams{
  id?: number;
  status?: OrderStatus;
}

/**
 *
 *
 * @export
 * @param {SearchParams} params
 * @param {number} page
 * @param {number} pageSize
 * @return {*}
 */
export async function searchOrderByPage(params: SearchParams, page: number, pageSize: number) {
  const data = await db.order.findMany({
    where: params,
    include: {
      anchor: {
        select: {
          name: true,
          id: true,
        },
      },
      company: {
        select: {
          name: true,
          id: true,
        },
      },
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
  const total = await db.order.count({
    where: params,
  });
  return { data, total };
}


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


/**
 * 主页选签约记录，生成直播间信息，根据时间区间筛选签约记录，即可能在播的直播间
 *
 * @export
 * @return {*}
 */
export function getOrderOrderByTime() {
  const userSelect = {
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  };
  return db.order.findMany({
    where: {
      time: {
        // 大于当前时间-6小时的开播记录
        gte: moment().subtract(6, 'hour').valueOf() / 1000,
        // 小于当前时间的开播记录
        lte: moment().valueOf() / 1000,
        // 小与当前时间+2天后的开播记录
        // lte: moment().add(2, 'day').valueOf() / 1000,
      },
    },
    include: {
      target: userSelect,
      author: userSelect,
    },
    orderBy: {
      // 顺序，时间越近越靠前
      time: 'asc',
    },
  });
};
