import { Order } from '@prisma/client';
import { Spin, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import React, { useState } from 'react';
import { useLoaderData, useSubmit, useTransition } from 'remix';
import { USER_PAGESIZE } from '~/const';
import { AuditOrderLoader } from '~/types';
import SearchInput from '../SearchInput';

export default function AuditOrderComp() {
  const transition = useTransition();
  const submit = useSubmit();
  const loaderData: AuditOrderLoader = useLoaderData();
  const { page, total, searchKey, data } = loaderData;
  const [key, setSearchKey] = useState(searchKey || '');
  const columns: ColumnsType<any> = [
    {
      title: '签约ID',
      dataIndex: 'id',
      key: 'id',
      render: (v) => v,
    },
    {
      title: '主播',
      dataIndex: 'anchorId',
      key: 'anchorId',
      render: (v) => v,
    },
    {
      title: '供应商',
      dataIndex: 'companyId',
      key: 'companyId',
      render: (v) => v,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 350,
      render: (value: Order, record: Order, index: number) => {
        if (!data) {
          return null;
        }
      },
    },
  ];
  function sendSearch(page: number) {
    submit({}, {
      method: 'get',
    });
  }
  return (
    <Spin spinning={transition.state !== 'idle'}>
      <div className="audit-wrapper">
        {/* 搜索框区域 */}
        <SearchInput defaultKey={key} sendSearch={() => sendSearch(1)} setSearchKey={setSearchKey} />
        {/* 审核表格部分，尝试使用嵌套路由渲染审核框 */}
        <div className="audit-table">
          <Table
            columns={columns}
            rowKey='id'
            pagination={{
              total,
              current: page,
              pageSize: USER_PAGESIZE,
              onChange: sendSearch,
              showSizeChanger: false,
            }}
            dataSource={data as any}
          />
        </div>
      </div>
    </Spin>);
};

