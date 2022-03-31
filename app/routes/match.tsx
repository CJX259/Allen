import { json, LinksFunction, LoaderFunction } from 'remix';
import React from 'react';
import MatchIndex from '~/components/match';
import { needLogined } from '~/utils/loginUtils';
import { getSession } from '~/sessions';
import { LoginKey, MATCH_COUNT, MAX_SIMILAR } from '~/const';
import { db } from '~/utils/db.server';
import styles from '~/styles/css/match.css';
import { MatchLoaderData, SessionUserData, UserJoinTag } from '~/types';
import { Role, Status, User } from '@prisma/client';
import { calcAvgRating } from '~/server/comment';
import { calcOrderCount } from '~/server/order';
import { PARAMS_ERROR } from '~/error';
import { findOrderedUsers, searchUserById } from '~/server/user';
import { findIntersection, findUnion } from '~/utils';
import { getSamekeyAndDifKey } from '~/utils/server.index';

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: styles },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  // 需要登录
  const redirect = await needLogined(request);
  if (redirect) {
    return redirect;
  }
  // 获取session
  const session = await getSession(request.headers.get('Cookie'));
  const loginUser = session.get(LoginKey) as SessionUserData;
  // 当前用户信息（外接标签）
  const curUser = await db.user.findUnique({
    where: {
      id: loginUser.id,
    },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
  if (!curUser) {
    return json(PARAMS_ERROR);
  }
  const curTagIds = curUser?.tags.map((item) => item.tagId) || [];
  // 根据当前用户的标签，找出与同类标签的用户，签约最多的供应商（or主播）
  const sameTagUsers = [] as any[];
  for (let i = 0; i < curTagIds.length; i++) {
    const tagId = curTagIds[i];
    const users = await matchSameTagUser(tagId, curUser?.role);
    sameTagUsers.push(...users);
  }
  // 再在同标签的供应商中，找出签约数量最多和好评率最高的
  const moreInfoUsers = await getRatingAndCountByUsers(sameTagUsers);
  // 按订单数排序，拿前几个
  const maxCountUser = moreInfoUsers.sort((a, b) => b.orderCount - a.orderCount).slice(0, MATCH_COUNT);
  // 按评分高低排序，拿前几个
  const maxQualityUser = moreInfoUsers.sort((a, b) => b.avgRating - a.avgRating).slice(0, MATCH_COUNT);
  const likeUsers = await guestYouLike(curUser) as UserJoinTag[];
  // 猜你喜欢，即
  return json({
    count: maxCountUser,
    quality: maxQualityUser,
    likeUsers,
  } as MatchLoaderData);
};

// 猜你喜欢计算过程
async function guestYouLike(curUser: UserJoinTag) {
  // 相似用户
  const similarUsers = await findSimilarUsers(curUser);
  // 最相似的几个用户
  const topSimilarUsers = await findTopSimilar(curUser, similarUsers);
  // 使用基于用户的协同推荐算法计算，得出TOP N（暂定6个）用户
  return collaborativeFiltering(curUser, topSimilarUsers);
};

// 找出相似用户（获取和已签约过的用户（另一类角色），签约的用户（同类角色）
async function findSimilarUsers(curUser: UserJoinTag) {
  // 同类角色的属性名
  const sameKey = curUser.role === Role.ANCHOR ? 'anchorId' : 'companyId';
  // 不同类角色的属性名
  const difKey = curUser.role === Role.ANCHOR ? 'companyId' : 'anchorId';
  const orderedUsers = await findOrderedUsers(curUser);
  // 再找出合作过的用户中，合作的其他用户（不包含本用户），即为相似用户
  const similarUsers: number[] = [];
  for (let i = 0; i < orderedUsers.length; i++) {
    const orderedId = orderedUsers[i];
    const orders = await db.order.findMany({
      where: {
        status: {
          not: 'REJECTED',
        },
        [sameKey]: {
          not: curUser.id,
        },
        [difKey]: orderedId,
      },
      distinct: [sameKey as any],
    });
    // 添加进similarUsers（去重）
    orders.forEach((item) => {
      if (similarUsers.indexOf(item[sameKey]) === -1) {
        similarUsers.push(item[sameKey]);
      }
    });
  }
  return similarUsers;
}

// 通过杰卡德相似系数法找出相似度最高的n个用户
async function findTopSimilar(curUser: UserJoinTag, similarUsers: number[]) {
  // 当前用户匹配过的用户，和相似用户匹配过得用户，交集除以并集，得出相似度
  const curOrdedUsers = await findOrderedUsers(curUser);
  // 存储相似度数组
  const res = [];
  for (let i = 0; i < similarUsers.length; i++) {
    const item = similarUsers[i];
    // 相似用户，角色是与当前用户角色一致的。
    const users = await findOrderedUsers({ id: item, role: curUser.role});
    const intersection = findIntersection(curOrdedUsers, users);
    const union = findUnion(curOrdedUsers, users);
    res.push({
      id: item,
      weight: (union.length / intersection.length),
    });
  }
  // 排序，筛选前n个
  res.sort((a, b) => b.weight - a.weight);
  return res.slice(0, MAX_SIMILAR).map((item) => {
    return {
      ...item,
      weight: +(item.weight.toFixed(3)),
    };
  });
}

// 协同过滤算法
async function collaborativeFiltering(curUser: UserJoinTag, topSimilarUsers: { id: number; weight: number; }[]) {
  const resUsers = [];
  const resWeights = [];
  const { sameKey, difKey } = getSamekeyAndDifKey(curUser);
  // 找出相似用户中签约过的另一类角色
  const recommendUsers: { anchorId?: number; companyId?: number; [key: string]: any }[] = await db.order.findMany({
    where: {
      AND: [
        {
          [sameKey]: {
            in: [...topSimilarUsers.map((item) => item.id)],
          },
        },
        {
          status: {
            not: 'REJECTED',
          },
        },
      ],
    },
    select: {
      [difKey]: true,
    },
    distinct: [difKey as any],
  });
  // 对找到的company按照推荐权重排序
  for (let i = 0; i < recommendUsers.length; i++) {
    let userWeight = 0;
    const recommendUser = recommendUsers[i];
    const recommendId = recommendUser[difKey];
    for (let j = 0; j < topSimilarUsers.length; j++) {
      const { id: similarId, weight } = topSimilarUsers[j];
      // 每个相似用户都看下有没有与当前推荐的角色用户签约，有则加权算入推荐权重
      const count = await db.order.count({
        where: {
          [sameKey]: similarId,
          [difKey]: recommendId,
        },
      });
      if (count > 1) {
        userWeight += weight;
      }
    }
    resWeights.push({
      id: recommendId,
      weight: userWeight,
    });
  }
  resWeights.sort((a, b) => b.weight - a.weight);
  for (let i = 0; i < resWeights.length; i++) {
    const { id } = resWeights[i];
    const user = await searchUserById(id);
    resUsers.push(user);
  }
  return resUsers;
};

// 匹配同类标签的用户（供应商则返回主播，主播则返回供应商）
async function matchSameTagUser(tagId: number, curRole?: Role): Promise<UserJoinTag[]> {
  // 这里不能加take，因为没有字段可以用作order，需全量拉出来后再计算排序
  return db.user.findMany({
    where: {
      tags: {
        some: {
          tagId,
        },
      },
      status: Status.RESOLVE,
      role: curRole === Role.COMPANY ? Role.ANCHOR : Role.COMPANY,
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
      // 连接order表，用于计算签约数最多的用户
      author: {
        select: {
          id: true,
        },
      },
      target: {
        select: {
          id: true,
        },
      },
    },
  });
}

// 找出这些id中，签约数最多的用户
async function getRatingAndCountByUsers(users: User[]) {
  const res = [];
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    // 该用户的签约总数量
    const count = await calcOrderCount(user.id);
    // 该用户的平均评分
    const avgRating = await calcAvgRating(user.id);
    res[i] = {
      ...user,
      orderCount: count,
      avgRating: avgRating || 0,
    };
  }
  // 针对orderCount字段排序，降序排序
  // 只拿前5个出来
  return res;
}

export default function Match() {
  return <MatchIndex />;
};


export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return (
    <div>
      <h1>500</h1>
      <h2>服务器出错</h2>
      <h3>{error.message}</h3>
    </div>
  );
};
