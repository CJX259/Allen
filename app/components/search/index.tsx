import React, { useState } from 'react';
import { Input, Button } from 'antd';
import { SubmitFunction, useLoaderData, useSubmit } from 'remix';
import { SearchOutlined } from '@ant-design/icons';
import { SearchLoaderData } from '~/types';
import ContentComp from './Content';

export default function SearchComp() {
  const loaderData: SearchLoaderData = useLoaderData();
  const [searchKey, setSearchKey] = useState(loaderData?.searchKey || '');
  const submit = useSubmit();
  console.log('loaderData', loaderData);
  return (
    <div className='search-wrapper'>
      {/* 搜索框区域 */}
      <div className='search-input'>
        <Input
          value={searchKey}
          placeholder='可通过id与昵称搜索'
          onKeyPress={(e) => e.key === 'Enter' && sendSearch(searchKey, submit) }
          onChange={(e) => setSearchKey(e.target.value)}
        />
        <Button
          type='primary'
          onClick={() => sendSearch(searchKey, submit)}
          icon={<SearchOutlined />}
        >搜索</Button>
      </div>
      {/* 搜索结果展示区 */}
      <div className="search-content">
        <ContentComp />
      </div>
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
