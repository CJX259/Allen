import { db } from '~/utils/db.server';

/**
 * key可以为id或name，id精确匹配，name模糊匹配，订单表的信息也返回
 *
 * @param {*} searchKey
 * @param {number} page
 * @param {number} limit
 * @param {boolean} isAudit
 * @return {*} user
 */
export async function searchUser(searchKey: any, page: number, limit: number) {
  // 后续需要外接订单表
  if (!searchKey) {
    // 无key搜索,只看页码
    return db.user.findMany({
      take: limit,
      skip: (page - 1) * limit,
    });
  }
  let resUser;
  const numberReg = /^\d+$/;
  if (numberReg.test(searchKey)) {
    resUser = await db.user.findUnique({
      where: {
        id: +searchKey,
      },
    });
    if (resUser) {
      return [resUser];
    }
  }
  return db.user.findMany({
    where: {
      name: {
        contains: searchKey,
      },
    },
    orderBy: {
      name: 'desc',
    },
    take: limit,
    skip: (page - 1) * limit,
  });
};
