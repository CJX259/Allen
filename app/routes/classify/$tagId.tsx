import React from 'react';
import { ActionFunction } from 'remix';
import { USER_PAGESIZE } from '~/const';
import { ClassifyLoaderData } from '~/types';

// 处理查询页的搜索请求，返回数据列表
export const loader: ActionFunction = async ({ request, params }) => {
  const searchParams = new URL(request.url).searchParams;
  const tagIdParams = searchParams.get('tagId');
  const tagId = tagIdParams ? +tagIdParams : null;
  const page = +(searchParams.get('page') || 1);
  const pageSize = +(searchParams.get('pageSize') || USER_PAGESIZE);
  console.log('params', page, pageSize);
  const res: ClassifyLoaderData = {
    tagId,
    data: null,
    total: 0,
    page,
    pageSize: USER_PAGESIZE,
  };
  // const { data, total } = await searchUserByTag(tagId, page, pageSize);
  // res.data = data;
  // res.total = total;
  return res;
};

export default function ClassifyComp() {
  console.log('tagid');
  return <h1>TagID</h1>;
};
