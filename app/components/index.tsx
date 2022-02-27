import { useLoaderData, Link, Outlet, useSubmit, SubmitFunction, useActionData } from 'remix';
import React, { useEffect } from 'react';
import { Popconfirm, Button, message } from 'antd';

// import type { User } from '@prisma/client';
// import { db } from '~/utils/db.server';
import { SessionUserData } from '~/types';

/**
 * 默认主页
 *
 * @export
 * @return {*}
 */
export default function Index() {
  const data = useLoaderData();
  const submit = useSubmit();
  const actionData = useActionData();
  useEffect(() => {
    actionData && message.success(actionData);
  }, [actionData]);
  return (
    <div className='page-wrapper'>
      {/* 顶部导航栏 */}
      <header className='page-header'>
        <Link to="/" prefetch='intent'>
          <div className='logo'></div>
        </Link>
        {/* 右侧操作区 */}
        {renderRightContent(data, submit)}
      </header>
      <div className='page-content'>
        <Outlet />
      </div>
    </div>
  );
}

interface InfoData {
  to: string;
  wording: string;
}

function renderRightContent(data: SessionUserData, submit: SubmitFunction) {
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
      {data &&
        <Popconfirm
          title="确认登出吗?"
          okText="确认"
          cancelText="取消"
          onConfirm={() => handleLogout(submit)}
        ><Button style={{ marginLeft: 10 }}>退出登录</Button>
        </Popconfirm>
      }
    </div>
  );
};

async function handleLogout(submit: SubmitFunction) {
  return submit({}, {
    method: 'post',
  });
}
