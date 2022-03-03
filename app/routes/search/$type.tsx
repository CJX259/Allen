import React from 'react';
import { ActionFunction } from 'remix';
import SearchComp from '~/components/search';
import { USER_PAGESIZE } from '~/const';
import { searchGoods } from '~/server/goods';
import { searchUser } from '~/server/user';
import { SearchLoaderData, SearchType } from '~/types';

// 处理查询页的搜索请求，返回数据列表
export const loader: ActionFunction = async ({ request, params }) => {
  const type = params.type as SearchType;
  const searchParams = new URL(request.url).searchParams;
  const searchKey = searchParams.get('searchKey');
  const page = +(searchParams.get('page') || 1);
  const pageSize = +(searchParams.get('pageSize') || USER_PAGESIZE);
  console.log('params', page, pageSize);
  const res: SearchLoaderData = {
    searchKey,
    data: null,
    searchType: type,
    total: 0,
    page,
    pageSize: USER_PAGESIZE,
  };
  switch (type) {
    case SearchType.user: {
      const { data, total } = await searchUser(searchKey, page, pageSize);
      res.data = data;
      res.total = total;
      break;
    }
    case SearchType.goods: {
      res.data = await searchGoods(searchKey, page, pageSize);
      break;
    }
  }
  return res;
};

export default function Search() {
  return <SearchComp />;
};
