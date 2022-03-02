import React, { useState } from 'react';
import { Input, Button, Spin } from 'antd';
import { SubmitFunction, useLoaderData, useSubmit, useTransition } from 'remix';
import { SearchOutlined } from '@ant-design/icons';
import { SearchLoaderData } from '~/types';
import CardItem from './CardItem';
import { RenderType } from '~/types/search';

export default function SearchComp() {
  const loaderData: SearchLoaderData = useLoaderData();
  const { searchKey, data } = loaderData;
  const [key, setSearchKey] = useState(searchKey || '');
  const submit = useSubmit();
  const transition = useTransition();
  console.log('loaderData', loaderData);
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
          {data?.map((user) => <CardItem key={user.id} data={user} type={RenderType.USER}/>)}
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
 */
function sendSearch(searchKey: string, submit: SubmitFunction) {
  submit({ searchKey }, {
    method: 'get',
  });
};
