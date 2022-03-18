import { ActionFunction, json, LinksFunction } from 'remix';
import React from 'react';
import MatchIndex from '~/components/match';
import { needLogined } from '~/utils/loginUtils';
import { getSession } from '~/sessions';
import { LoginKey } from '~/const';
import { db } from '~/utils/db.server';
import styles from '~/styles/css/match.css';
import { MatchActionData, SessionUserData } from '~/types';
import { Role, User } from '@prisma/client';
import { calcAvgRating } from '~/server/comment';
import { calcOrderCount } from '~/server/order';

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: styles },
  ];
};

export const action: ActionFunction = async ({ request }) => {
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
  const curTagIds = curUser?.tags.map((item) => item.tagId) || [];
  // 根据当前用户的标签，找出与同类标签的用户，签约最多的供应商（or主播）
  const sameTagUsers = [] as any[];
  for (let i = 0; i < curTagIds.length; i++) {
    const tagId = curTagIds[i];
    const users = await matchSameTagUser(tagId, curUser?.role);
    sameTagUsers.push(...users);
  }
  // 再在同标签的供应商中，找出签约数量最多和好评率最高的
  // const maxCountCompany = findMaxCountCompany(sameTagUsers.map((item) => item.id));

  const maxCountUser = await findMaxCountUser(sameTagUsers);
  const maxQualityUser = await findQualityUser(sameTagUsers);
  return json({
    count: maxCountUser,
    quality: maxQualityUser,
  } as MatchActionData);
};

// 匹配同类标签的用户（供应商则返回主播，主播则返回供应商）
async function matchSameTagUser(tagId: number, curRole?: Role): Promise<User[]> {
  // 这里不能加take，因为没有字段可以用作order，需全量拉出来后再计算排序
  return db.user.findMany({
    where: {
      tags: {
        every: {
          tagId,
        },
      },
      role: curRole === Role.COMPANY ? Role.ANCHOR : Role.COMPANY,
    },
    include: {
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
async function findMaxCountUser(users: User[]) {
  const res = [];
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    // 该用户的签约总数量
    const count = await calcOrderCount(user.id);
    res[i] = {
      ...user,
      orderCount: count,
    };
  }
  // 针对orderCount字段排序，降序排序
  // 只拿前5个出来
  return res.sort((a, b) => b.orderCount - a.orderCount).slice(0, 5);
}

// 找出这些id中，按好评评分均值高低筛选
async function findQualityUser(users: User[]) {
  const res = [];
  // 找出对该用户的所有评论
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const avgRating = await calcAvgRating(user.id);
    res[i] = {
      ...user,
      avgRating: avgRating || 0,
    };
  }
  // 按照平均评分值，从高到低排序，后筛选出前5位用户
  return res.sort((a, b) => b.avgRating - a.avgRating).slice(0, 5);
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
