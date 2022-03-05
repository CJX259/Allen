import { Status } from '@prisma/client';
import { Button, Input, Radio, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { useLoaderData, useSubmit, useTransition } from 'remix';
import { SearchOutlined } from '@ant-design/icons';
import { AuditUserLoaderData } from '~/types';

export default function AuditUserComp() {
  const loaderData: AuditUserLoaderData = useLoaderData();
  const { searchKey, data, page, total } = loaderData;
  const [key, setSearchKey] = useState(searchKey || '');
  const [status, setStatus] = useState(Status.ALL as any);
  const submit = useSubmit();
  const transition = useTransition();
  useEffect(() => {
    sendSearch();
  }, [status]);
  function sendSearch() {
    console.log('status', status);
    // 重置分页器
    const params = {
      searchKey,
    } as any;
    if (page) {
      params.page = page;
    };
    submit(params, {
      method: 'get',
    });
  };
  return (
    <Spin spinning={transition.state !== 'idle'}>
      <div className="audit-wrapper">
        {/* 搜索框区域 */}
        <div className='search-input'>
          <Input
            value={key}
            placeholder='可通过id与昵称搜索'
            onKeyPress={(e) => e.key === 'Enter' && sendSearch() }
            onChange={(e) => setSearchKey(e.target.value)}
          />
          <Button
            type='primary'
            onClick={() => sendSearch()}
            icon={<SearchOutlined />}
          >搜索</Button>
        </div>
        <div className="search-status">
          <span>审核状态：</span>
          <Radio.Group onChange={(e) => setStatus(e.target.value)} value={status}>
            <Radio value={Status.ALL}>全部</Radio>
            <Radio value={Status.PENDING}>待审核</Radio>
            <Radio value={Status.REJECT}>已下架</Radio>
            <Radio value={Status.RESOLVE}>已上架</Radio>
          </Radio.Group>
        </div>
        {/* 审核表格部分，尝试使用嵌套路由渲染审核框 */}
        <div className="audit-table">

        </div>
      </div>
    </Spin>
  );
};
