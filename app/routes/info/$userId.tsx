import React from 'react';
import { ActionFunction } from 'remix';
import InfoIndex from '~/components/info/index';


// 处理查询页的搜索请求，返回数据列表
export const loader: ActionFunction = async ({ request, params }) => {
  const userId = params.userId;

  return userId;
};

export default function UserInfo() {
  return <InfoIndex />;
}
