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
      where: {
        role: {
          not: 'ADMIN',
        },
      },
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
      role: {
        not: 'ADMIN',
      },
    },
    take: limit,
    skip: (page - 1) * limit,
  });
};

/**
 * 得到符合筛选条件的总数
 *
 * @export
 * @param {*} searchKey
 * @return {*} number
 */
export async function getUserCount(searchKey: any) {
  if (!searchKey) {
    return db.user.count({
      where: {
        role: {
          not: 'ADMIN',
        },
      },
    });
  }
  let res;
  const numberReg = /^\d+$/;
  if (numberReg.test(searchKey)) {
    res = await db.user.count({
      where: {
        id: +searchKey,
      },
    });
    if (res) {
      return res;
    }
  }
  return db.user.count({
    where: {
      name: {
        contains: searchKey,
      },
      role: {
        not: 'ADMIN',
      },
    },
  });
};
