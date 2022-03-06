import React from 'react';
import { ActionFunction, json, LoaderFunction } from 'remix';
import InfoIndex from '~/components/info/index';
import { PARAMS_ERROR } from '~/error';
import { searchUserById } from '~/server/user';


// 处理查询页的搜索请求，返回数据列表
export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = params.userId;
  if (!userId) {
    return json(PARAMS_ERROR);
  }

  const user = await searchUserById(+userId);
  return user;
};
export const action: ActionFunction = async ({request }) => {
  return null;
};

export default function UserInfo() {
  return <InfoIndex />;
}
