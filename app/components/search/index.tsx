import React, { useState } from 'react';
import { Spin, Pagination } from 'antd';
import { useLoaderData, useSubmit, useTransition } from 'remix';
import { SearchLoaderData, SearchType, UserJoinTag } from '~/types';
import GoodsCardItem from './GoodsCardItem';
import { Goods } from '@prisma/client';
import UserCardItem from '../UserCardItem';
import { USER_PAGESIZE } from '~/const';
import SearchInput from '../SearchInput';

export default function SearchComp() {
  const loaderData: SearchLoaderData = useLoaderData();
  const { searchKey, data, searchType, page, total } = loaderData;
  // key是前端维护的搜索key，searchKey是服务端返回的，可用作初始化
  const [key, setSearchKey] = useState(searchKey || '');
  const submit = useSubmit();
  const transition = useTransition();
  function sendSearch(page: number) {
    // 重置分页器
    const params = {
      searchKey: key || '',
      page: page.toString(),
    };
    submit(params, {
      method: 'get',
    });
  };
  return (
    <div className='search-wrapper'>
      <Spin spinning={transition.state !== 'idle'}>
        {/* 搜索框区域 */}
        <SearchInput defaultKey={key} sendSearch={() => sendSearch(1)} setSearchKey={setSearchKey} />
        {/* 搜索结果展示区 */}
        <div className="search-content">
          {data?.map((item) => searchType === SearchType.goods ?
          <GoodsCardItem key={item.id} data={item as Goods} /> :
          <UserCardItem key={item.id} data={item as UserJoinTag} />)}
        </div>
        <div className="search-pager">
          {!data?.length ?
            <h2>暂无结果</h2> :
            <Pagination
              current={page}
              total={total || 0}
              disabled={!data?.length}
              onChange={(page) => sendSearch(page)}
              pageSize={USER_PAGESIZE}
              showSizeChanger={false}
            />
          }
        </div>
      </Spin>
    </div>
  );
};

/**
 * 发起搜索请求
 *
 * @param {string} searchKey
 * @param {SubmitFunction} submit
 * @param {number} [page]
 * @param {number} [pageSize]
 */
