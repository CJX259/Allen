import { LoaderFunction, useLoaderData, Link, LinksFunction } from 'remix';
import React from 'react';
import { Button } from 'antd';

// import type { User } from '@prisma/client';
// import { db } from '~/utils/db.server';
import { getSession } from '~/sessions';
import { hadLogin } from '~/utils/loginUtils';
import { LoginKey } from '~/const';
import { SessionUserData } from '~/types';
import indexStyles from '../styles/css/indexPage.css';

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: indexStyles }];
};

export const loader: LoaderFunction = async ({ request }) => {
  if (!await hadLogin(request.headers.get('Cookie'))) {
    // 没登录返回null
    return null;
  }
  // 已登录则返回session内容
  const session = await getSession(
      request.headers.get('Cookie'),
  );
  const sessionUser = session.get(LoginKey);
  // const data: User | null = await db.user.findUnique({
  //   where: {
  //     id: sessionUser.id,
  //   },
  // });
  // 不返回null，后续要用null判断有无登录态
  return sessionUser || {};
};


/**
 * 默认主页
 *
 * @export
 * @return {*}
 */
export default function Index() {
  const data = useLoaderData();
  return (
    <div className='page-wrapper'>
      {/* 顶部导航栏 */}
      <header className='page-header'>
        <Link to="/" prefetch='intent'>
          <div className='logo'></div>
        </Link>
        {/* 右侧操作区 */}
        {renderRightContent(data)}
      </header>
    </div>
  );
}

interface InfoData {
  to: string;
  wording: string;
}

function renderRightContent(data: SessionUserData) {
  const noUserLink: InfoData = {
    to: '/login',
    wording: '登录/注册',
  };
  const userLink: InfoData = {
    to: '/home/info',
    wording: '我的信息',
  };
  let renderLink = noUserLink;
  if (!data) {
    // 显示登录/注册
    renderLink = {...noUserLink};
  } else {
    renderLink = {...userLink};
  }
  return (
    <div className="right-content">
      <Link prefetch='intent' to={renderLink.to}>
        <Button type='primary'>{renderLink.wording}</Button>
      </Link>
    </div>
  );
};
