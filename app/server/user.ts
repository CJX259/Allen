import { Role, Status, User } from '@prisma/client';
import { UserJoinTag } from '~/types';
import { db } from '~/utils/db.server';
import { getSamekeyAndDifKey } from '~/utils/server.index';
import { calcAvgRating } from './comment';
import { calcOrderCount } from './order';


/**
 * 为传入的user数组每个元素都添加平均评分与总签约数字段
 *
 * @param {UserJoinTag[]} data
 */
export async function calcAvgRatingAndOrderCount(data: UserJoinTag[]) {
  // 每个数据设置
  for (let i = 0; i < data.length; i++) {
    const ele = data[i];
    ele.avgRating = await calcAvgRating(ele.id);
    ele.orderCount = await calcOrderCount(ele.id);
  }
}

/**
 * key可以为id或name，id精确匹配，name模糊匹配，订单表的信息也返回，status状态筛选，不传则返回全部status
 *
 * @param {*} searchKey
 * @param {number} page
 * @param {number} limit
 * @param {Status} status
 * @return {*} user
 */
export async function searchUser(searchKey: string, page: number, limit: number, status: Status) {
  // status状态筛选，不传则返回全部status
  const statusConfig = status !== Status.ALL ? [status] : [Status.PENDING, Status.RESOLVE, Status.REJECT];
  // 连接外表（user -> tagOnUser -> tag -> tag.name）
  const includeConfig = {
    tags: {
      include: {
        tag: {
          select: {
            name: true,
          },
        },
      },
    },
  };
  const ORConfig = [
    {
      id: +searchKey || -1,
    },
    {
      name: {
        contains: searchKey || '',
      },
    },
  ];
  const res = {
    data: [] as UserJoinTag[],
    total: 0,
  };
  // 后续需要外接订单表
  res.data = await db.user.findMany({
    where: {
      OR: ORConfig,
      role: {
        not: 'ADMIN',
      },
      status: {
        in: statusConfig,
      },
    },
    include: includeConfig,
    take: limit,
    skip: (page - 1) * limit,
  });
  await calcAvgRatingAndOrderCount(res.data);
  res.total = await db.user.count({
    where: {
      OR: ORConfig,
      role: {
        not: 'ADMIN',
      },
      status: {
        in: statusConfig,
      },
    },
  });
  return res;
};


/**
 * 查出具有该tag的user
 *
 * @export
 * @param {number} tagId
 * @param {number} page
 * @param {number} limit
 * @return {*}
 */
export async function searchUserByTag(tagId: number, page: number, limit: number) {
  const users = await db.user.findMany({
    where: {
      tags: {
        some: {
          tagId,
        },
      },
      // 仅拿出已上架的
      status: Status.RESOLVE,
    },
    include: {
      tags: {
        include: {
          tag: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      },
    },
    take: limit,
    skip: (page - 1) * limit,
  });
  // 查出用户的平均评分与总签约数
  await calcAvgRatingAndOrderCount(users);
  const total = await db.user.count({
    where: {
      tags: {
        some: {
          tagId,
        },
      },
      status: Status.RESOLVE,
    },
  });
  const tag = await db.tag.findUnique({
    where: {
      id: tagId,
    },
    select: {
      name: true,
      id: true,
    },
  });
  return { data: users, total, tag };
};


/**
 * 更新用户数据
 *
 * @export
 * @param {number} id
 * @param {User} params
 * @return {*}
 */
export async function updateUser(id: number, params: User) {
  return db.user.update({
    where: {
      id,
    },
    data: {
      ...params,
    },
    select: {
      id: true,
    },
  });
};

/**
 * 通过id搜索用户
 *
 * @export
 * @param {number} id
 * @return {*}
 */
export async function searchUserById(id: number) {
  const user = await db.user.findUnique({
    where: {
      id,
    },
    include: {
      tags: {
        include: {
          tag: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      },
    },
  });
  await calcAvgRatingAndOrderCount([user as UserJoinTag]);
  return user;
};


/**
 * 更新用户经验
 *
 * @export
 * @param {number} authorId
 * @param {number} targetId
 * @return {*}
 */
export async function addExperience(authorId: number, targetId: number) {
  const promsFind = [];
  const promsUpdate = [];
  promsFind.push(db.user.findUnique({
    where: {
      id: authorId,
    },
    select: {
      experience: true,
    },
  }));
  promsFind.push(db.user.findUnique({
    where: {
      id: targetId,
    },
    select: {
      experience: true,
    },
  }));
  const [authorExp, targetExp] = await Promise.all(promsFind);
  if (authorExp === null || targetExp === null) {
    throw new Error('用户不存在,经验录入失败');
  }
  console.log('exp', authorExp, targetExp);
  promsUpdate.push(db.user.update({
    where: {
      id: authorId,
    },
    data: {
      experience: authorExp.experience + 10,
    },
  }));
  promsUpdate.push(db.user.update({
    where: {
      id: targetId,
    },
    data: {
      experience: targetExp.experience + 10,
    },
  }));
  return Promise.all(promsUpdate);
};

// 查找某用户签约过的用户
export async function findOrderedUsers(curUser: { id: number; role: Role; [key: string]: any;}) {
  const { sameKey, difKey } = getSamekeyAndDifKey(curUser);
  // 本用户签约过的订单
  const orders = await db.order.findMany({
    where: {
      status: {
        not: 'REJECTED',
      },
      [sameKey]: curUser.id,
    },
    // select: {
    //   companyId: true,
    //   anchorId: true,
    // },
    include: {
      company: {
        select: {
          role: true,
        },
      },
      anchor: {
        select: {
          role: true,
        },
      },
    },
    distinct: [difKey as any],
  });
  // 从中拿出合作过的用户
  return orders.map((item) => {
    if (curUser.role === Role.ANCHOR) {
      // 主播则返回供应商id
      return item.companyId;
    } else {
      return item.anchorId;
    }
  });
};
