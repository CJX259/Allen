import { User } from '@prisma/client';
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
  const res = {
    data: [] as User[],
    total: 0,
  };
  // 后续需要外接订单表
  if (!searchKey) {
    // 无key搜索,只看页码
    res.data = await db.user.findMany({
      where: {
        role: {
          not: 'ADMIN',
        },
      },
      take: limit,
      skip: (page - 1) * limit,
    });
    res.total = await db.user.count({
      where: {
        role: {
          not: 'ADMIN',
        },
      },
    });
    return res;
  }
  const numberReg = /^\d+$/;
  // 如果传的key全为number，则先试下id精确匹配
  if (numberReg.test(searchKey)) {
    const temp = await db.user.findFirst({
      where: {
        id: +searchKey,
        role: {
          not: 'ADMIN',
        },
      },
    });
    if (temp) {
      res.data = [temp];
      res.total = 1;
      return res;
    }
  }
  // 根据昵称模糊匹配
  res.data = await db.user.findMany({
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
  res.total = await db.user.count({
    where: {
      name: {
        contains: searchKey,
      },
      role: {
        not: 'ADMIN',
      },
    },
  });
  return res;
};
