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
          </div>
          {
            !data.length &&
            <>
              <h2>欢迎进入Allen平台, 最近没有主播在直播</h2>
              <h3>如果您是主播，在这里您可以找到与您匹配的供应商，通过签约可以升级，能够接受更多的厂商带货需求，放心大胆地发挥你的专业领域吧！</h3>
              <h3>如果您是供应商，在这里您可以低成本地找到契合自身产品的专业主播帮您带货，可以无需再花大价钱请天价主播，也能轻松获得直播销量红利！</h3>
            </>
          }
        </Spin>
      </div>
    </>
  );
};
