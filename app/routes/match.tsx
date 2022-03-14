import { ActionFunction, json, LinksFunction } from 'remix';
import React from 'react';
import MatchIndex from '~/components/match';
import { needLogined } from '~/utils/loginUtils';
import { getSession } from '~/sessions';
import { LoginKey } from '~/const';
import { db } from '~/utils/db.server';
import styles from '~/styles/css/match.css';
import { SessionUserData } from '~/types';
import { OrderStatus, Role, User } from '@prisma/client';

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
  // 根据当前用户的标签，找出与同类标签的主播，签约最多的供应商
  const sameTagCompanys = [] as any[];
  for (let i = 0; i < curTagIds.length; i++) {
    const tagId = curTagIds[i];
    const companies = await matchSameTagCompany(tagId, curUser?.role);
    sameTagCompanys.push(...companies);
  }
  console.log('sameTagCompanys', sameTagCompanys);
  // 再在同标签的供应商中，找出签约数量最多和好评率最高的
  // const maxCountCompany = findMaxCountCompany(sameTagCompanys.map((item) => item.id));

  return json({ data: sameTagCompanys });
};

// 匹配同类标签的供应商
async function matchSameTagCompany(tagId: number, curRole?: Role): Promise<any []> {
  const sameTagUsers = await db.user.findMany({
    where: {
      tags: {
        every: {
          tagId,
        },
      },
      role: Role.COMPANY,
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
  console.log('sameTagUsers', sameTagUsers);
  const count = await findMaxCountCompany(sameTagUsers);
  return sameTagUsers;
}

// 找出这些id中，按签约数筛选
async function findMaxCountCompany(users: User[]) {
  const res = [];
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    // 该用户的签约总数量
    const count = await db.order.count({
      where: {
        OR: [
          {
            authorId: user.id,
          },
          {
            targetId: user.id,
          },
        ],
        status: {
          not: OrderStatus.REJECTED,
        },
      },
    });
    res[i] = {
      ...user,
      orderCount: count,
    };
  }
  // 针对orderCount字段排序，降序排序
  return res;
}

// 找出这些id中，按好评率筛选
async function findQulatiy(params: any) {
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
