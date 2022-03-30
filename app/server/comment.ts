import { OrderOpts } from '~/types';
import { db } from '~/utils/db.server';

/**
 * 更新评论
 *
 * @param {number} id
 * @param {OrderOpts} opts
 * @return {*}
 */
export async function handleComment(id: number, opts: OrderOpts) {
  // 已是最后阶段,处理评论,登记经验值
  const { comment, rating, fromId, toId } = opts;
  return await db.userComment.upsert({
    where: {
      orderId_fromId_toId: {
        orderId: id,
        fromId,
        toId,
      },
    },
    create: {
      fromId,
      toId,
      orderId: id,
      comment,
      rating,
    },
    update: {
      comment,
      rating,
    },
  });
};


/**
 * 计算某个用户的平均评分
 *
 * @export
 * @param {number} userId
 * @return {*}
 */
export async function calcAvgRating(userId: number) {
  return await db.userComment.aggregate({
    _avg: {
      rating: true,
    },
    where: {
      toId: userId,
    },
  });
  // const comment = await db.userComment.findMany({
  //   where: {
  //     toId: userId,
  //   },
  //   select: {
  //     rating: true,
  //   },
  // });
  // const totalRating = comment.reduce((prev, cur) => {
  //   return prev + cur.rating;
  // }, 0);
  // return (totalRating / comment.length);
};


/**
 * 获得用户的评论数据和平均评分
 *
 * @export
 * @param {number} userId
 * @return {*}
 */
export async function getUserComment(userId: number) {
  const comments = await db.userComment.findMany({
    where: {
      toId: userId,
    },
    include: {
      from: {
        select: {
          name: true,
          avatarKey: true,
        },
      },
    },
    orderBy: {
      ctime: 'desc',
    },
  });
  const avgRating = await calcAvgRating(userId);
  return {
    comments,
    avgRating,
  };
};
