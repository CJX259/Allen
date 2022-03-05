import React, { useState } from 'react';
import { Input, Button, Spin, Pagination } from 'antd';
import { SubmitFunction, useLoaderData, useSubmit, useTransition } from 'remix';
import { SearchOutlined } from '@ant-design/icons';
import { SearchLoaderData, SearchType, UserJoinTag } from '~/types';
import GoodsCardItem from './GoodsCardItem';
import { Goods } from '@prisma/client';
import UserCardItem from '../UserCardItem';
import { USER_PAGESIZE } from '~/const';

export default function SearchComp(props: { isAudit?: boolean; }) {
  const loaderData: SearchLoaderData = useLoaderData();
  const { searchKey, data } = loaderData;
  const [key, setSearchKey] = useState(searchKey || '');
  const submit = useSubmit();
  const transition = useTransition();
  return (
    <div className='search-wrapper'>
      <Spin spinning={transition.state !== 'idle'}>
        {/* 搜索框区域 */}
        <div className='search-input'>
          <Input
            value={key}
            placeholder='可通过id与昵称搜索'
            onKeyPress={(e) => e.key === 'Enter' && sendSearch(key, submit) }
            onChange={(e) => setSearchKey(e.target.value)}
          />
          <Button
            type='primary'
            onClick={() => sendSearch(key, submit)}
            icon={<SearchOutlined />}
          >搜索</Button>
        </div>
        {/* 搜索结果展示区 */}
        <div className="search-content">
          {data?.map((item) => loaderData.searchType === SearchType.goods ?
          <GoodsCardItem key={item.id} data={item as Goods} /> :
          <UserCardItem key={item.id} data={item as UserJoinTag} />)}
        </div>
        <div className="search-pager">
          <Pagination
            current={loaderData.page}
            total={loaderData.total || 0}
            onChange={(page) => sendSearch(searchKey || '', submit, page)}
            pageSize={USER_PAGESIZE}
          />
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
function sendSearch(searchKey: string, submit: SubmitFunction, page?: number, pageSize?: number) {
  // 重置分页器
  const params = {
    searchKey,
  } as any;
  if (page) {
    params.page = page;
  };
  if (pageSize) {
    params.pageSize = pageSize;
  };
  submit(params, {
    method: 'get',
  });
};
