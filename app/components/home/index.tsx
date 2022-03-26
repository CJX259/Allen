import { Spin } from 'antd';
import React from 'react';
import { useLoaderData, useTransition } from 'remix';
import { HomeLoaderData } from '~/types';
import UserCardItem from '../UserCardItem';

export default function HomeCmop() {
  const loaderData: HomeLoaderData = useLoaderData();
  const transition = useTransition();
  const { data, curUser } = loaderData || {};
  console.log('HomeCmopdata', data);
  return (
    <>
      <div className='home-wrapper'>
        <h1>直播间: </h1>
        <Spin spinning={transition.state !== 'idle'}>
          {/* 搜索结果展示区 */}
          <div className="live-content">
            {data?.map((item) => <UserCardItem curUser={curUser} jumpRoom={true} key={item.id} data={item} />)}
            {!data.length && <h2>最近没有主播在直播</h2>}
          </div>
        </Spin>
      </div>
    </>
  );
};
