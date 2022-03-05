import { Status } from '@prisma/client';
import { UserJoinTag } from '~/types';
import { db } from '~/utils/db.server';

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
