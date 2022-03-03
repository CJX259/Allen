import React from 'react';
import { ActionFunction } from 'remix';
import SearchComp from '~/components/search';
import { searchUser } from '~/server/user';
import { SearchLoaderData, SearchType } from '~/types';

// 处理查询页的搜索请求，返回数据列表
export const loader: ActionFunction = async ({ request, params }) => {
  const type = params.type as SearchType;
  const searchParams = new URL(request.url).searchParams;
  const searchKey = searchParams.get('searchKey');
  const page = +(searchParams.get('page') || 1);
  const limit = +(searchParams.get('limit') || 3);
  const res: SearchLoaderData = {
    searchKey,
    data: null,
    searchType: type,
  };
  switch (type) {
    case SearchType.user: {
      res.data = await searchUser(searchKey, page, limit);
      break;
    }
    case SearchType.goods: {
      break;
    }
  }
  return res;
};

export default function Search() {
  return <SearchComp />;
};
