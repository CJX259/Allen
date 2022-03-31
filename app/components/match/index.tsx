import { Button, Spin, Tabs } from 'antd';
import React from 'react';
import { useLoaderData, useSubmit, useTransition } from 'remix';
import { MatchLoaderData } from '~/types';
import UserCardItem from '../UserCardItem';

const { TabPane } = Tabs;

export default function MatchIndex() {
  const transition = useTransition();
  const loaderData: MatchLoaderData | undefined = useLoaderData();
  const submit = useSubmit();
  const { count, quality, likeUsers } = loaderData || {};
  function refresh() {
    submit({}, { method: 'get' });
  }
  return (
    <Spin tip="匹配中..." spinning={transition.state !== 'idle'}>
      <Button onClick={refresh}>刷新</Button>
      <div className="user-card-wrapper">
        <Tabs style={{ width: '100%' }} defaultActiveKey="1" onChange={() => console.log('cahnge')}>
          <TabPane tab="签约数最高用户" key="1">
            <div className="user-card-content">
              {count?.map((item) => <UserCardItem key={`count_${item.id}`} data={item} />)}
              {!count?.length && <h2>暂无同类标签用户数据</h2>}
            </div>
          </TabPane>
          <TabPane tab="评分最高用户" key="2">
            <div className="user-card-content">
              {quality?.map((item) => <UserCardItem key={`quality_${item.id}`} data={item} />)}
              {!quality?.length && <h2>暂无同类标签用户数据</h2>}
            </div>
          </TabPane>
          <TabPane tab="猜你喜欢" key="3">
            <div className="user-card-content">
              {likeUsers?.map((item) => <UserCardItem key={`like_${item.id}`} data={item} />)}
              {!quality?.length && <h2>暂无推荐用户数据</h2>}
            </div>
          </TabPane>
        </Tabs>
      </div>
    </Spin>
  );
}
