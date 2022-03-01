import { useLoaderData, Link, Outlet, useSubmit, SubmitFunction, useActionData } from 'remix';
import React, { useEffect } from 'react';
import { Popconfirm, Button, message } from 'antd';
// import type { User } from '@prisma/client';
// import { db } from '~/utils/db.server';
import { SessionUserData } from '~/types';
import MenuComp from '../Menu';
import { RootLoaderData } from '~/types/loaderData';
/**
 * 默认主页
 *
 * @export
 * @return {*}
 */
export default function RootComp() {
  const data: RootLoaderData = useLoaderData();
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
        {renderRightContent(data?.user, submit)}
      </header>
      <div className='page-content'>
        <div className="page-content-menu">
          <MenuComp menuList={data?.menuList || []} pathname={data.pathname}/>
        </div>
        <div className="page-content-main">
          <Outlet />
        </div>
      </div>
      <footer className='page-footer'>
        <a target="_blank" rel="noreferrer" href="https://beian.miit.gov.cn/">粤ICP备20041191号</a>
      </footer>
    </div>
  );
}

interface InfoData {
  to: string;
  wording: string;
}


/**
 * 渲染header右侧按钮
 *
 * @param {SessionUserData} user
 * @param {SubmitFunction} submit
 * @return {*} JSX.Element
 */
function renderRightContent(user: SessionUserData | null, submit: SubmitFunction) {
  const noUserLink: InfoData = {
    to: '/login',
    wording: '登录/注册',
  };
  const userLink: InfoData = {
    to: '/home',
    wording: '我的信息',
  };
  let renderLink = noUserLink;
  if (!user) {
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
      {user &&
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


/**
 * 发起登出请求
 *
 * @param {SubmitFunction} submit
 * @return {*} Promise<void>
 */
async function handleLogout(submit: SubmitFunction) {
  return submit({}, {
    method: 'delete',
    action: '/login',
  });
}
