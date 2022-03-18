import { Status, User } from '@prisma/client';
import { UserJoinTag } from '~/types';
import { db } from '~/utils/db.server';
import { calcAvgRating } from './comment';
import { calcOrderCount } from './order';


/**
 * 为传入的user数组每个元素都添加平均评分与总签约数字段
 *
 * @param {UserJoinTag[]} data
 */
async function calcAvgRatingAndOrderCount(data: UserJoinTag[]) {
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
export async function searchUser(searchKey: any, page: number, limit: number, status: Status) {
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
  const res = {
    data: [] as UserJoinTag[],
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
        role: {
          not: 'ADMIN',
        },
        status: {
          in: statusConfig,
        },
      },
    });
    return res;
  }
  const numberReg = /^\d+$/;
  // 如果传的key全为number，则先试下id精确匹配
  if (numberReg.test(searchKey)) {
    const temp = await db.user.findFirst({
      include: includeConfig,
      where: {
        id: +searchKey,
        role: {
          not: 'ADMIN',
        },
        status: {
          in: statusConfig,
        },
      },
    });
    if (temp) {
      res.data = [temp];
      await calcAvgRatingAndOrderCount(res.data);
      res.total = 1;
      return res;
    }
  }
  // 根据昵称模糊匹配
  res.data = await db.user.findMany({
    include: includeConfig,
    where: {
      name: {
        contains: searchKey,
      },
      role: {
        not: 'ADMIN',
      },
      status: {
        in: statusConfig,
      },
    },
    take: limit,
    skip: (page - 1) * limit,
  });
  await calcAvgRatingAndOrderCount(res.data);
  res.total = await db.user.count({
    where: {
      name: {
        contains: searchKey,
      },
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
  // 这里连接表时不能再嵌套where操作，导致只能将数据拿出来后再进行筛选，会导致每页实际渲染数据数不同
  // 直接全量拿？
  const data = await db.tagsOnUsers.findMany({
    where: {
      tagId,
    },
    take: limit,
    skip: (page - 1) * limit,
    include: {
      user: {
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
      },
    },
  });
  const total = await db.tagsOnUsers.count({
    where: {
      tagId,
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
  // 仅筛选出已上架的用户
  const userData = data?.map((item) => item.user);
  return { data: userData, total, tag };
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
  return db.user.findUnique({
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
