import { ActionFunction, LinksFunction } from 'remix';
import React from 'react';
import MatchIndex from '~/components/match';
import { needLogined } from '~/utils/loginUtils';
import { getSession } from '~/sessions';
import { LoginKey } from '~/const';
import { db } from '~/utils/db.server';
import styles from '~/styles/css/match.css';
import { SessionUserData } from '~/types';
import { Role, User } from '@prisma/client';

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
  const matchCompany = [] as User[];
  curTagIds.forEach(async (tagId) => {
    matchCompany.push(...(await matchSameTagCompany(tagId)));
  });
  console.log('matchCompany', matchCompany);
  return curUser;
};

// 匹配同类标签的供应商
async function matchSameTagCompany(tagId: number): Promise<User []> {
  const sameTagUsers = await db.user.findMany({
    where: {
      tags: {
        every: {
          tagId,
        },
      },
      role: Role.COMPANY,
    },
  });
  console.log('sameTagUsers', sameTagUsers);
  return sameTagUsers;
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
