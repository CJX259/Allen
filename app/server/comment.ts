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
