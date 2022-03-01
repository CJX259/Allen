import React from 'react';
import { ActionFunction } from 'remix';
import SearchComp from '~/components/search';
import { searchUser } from '~/server/user';
import { SearchLoaderData } from '~/types';

// 处理查询页的搜索请求，返回数据列表
export const loader: ActionFunction = async ({ request, params }) => {
  const role = params.role;
  const searchParams = new URL(request.url).searchParams;
  const searchKey = searchParams.get('searchKey');
  const page = +(searchParams.get('page') || 1);
  const limit = +(searchParams.get('limit') || 1);
  const res: SearchLoaderData = {
    searchKey,
    data: null,
  };
  switch (role) {
    case 'user': {
      res.data = await searchUser(searchKey, page, limit);
      break;
    }
    case 'goods': {
      break;
    }
  }
  return res;
};

export default function SearchType() {
  return <SearchComp />;
};
