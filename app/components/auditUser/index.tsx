import { Role, Status } from '@prisma/client';
import { Button, Input, Radio, Spin, Table, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { useLoaderData, useSubmit, useTransition } from 'remix';
import { SearchOutlined } from '@ant-design/icons';
import { AuditUserLoaderData } from '~/types';
import { ColumnsType } from 'antd/lib/table';
import { AUDIT_STATUS_MAP, ROLE_MAP, USER_PAGESIZE } from '~/const';
import { formatFormData } from '~/utils/client.index';

export default function AuditUserComp() {
  const loaderData: AuditUserLoaderData = useLoaderData();
  const { searchKey, data, page, total, status: loaderStatus } = loaderData;
  console.log('data', loaderData);
  const [key, setSearchKey] = useState(searchKey || '');
  const [status, setStatus] = useState(loaderStatus || Status.ALL as any);
  const submit = useSubmit();
  const transition = useTransition();
  // 表格列
  const columns: ColumnsType<any> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (v) => v,
    },
    {
      title: '昵称',
      dataIndex: 'name',
      key: 'name',
      render: (v) => v,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (v: Role) => {
        return <Tag color={v === Role.ANCHOR ? 'green' : 'red'}>{ROLE_MAP[v]}</Tag>;
      },
    },
    {
      title: '审核状态',
      dataIndex: 'status',
      key: 'status',
      render: (v: Status) => {
        let color = 'orange';
        if (v === Status.REJECT) {
          color = 'red';
        }
        if (v === Status.RESOLVE) {
          color = 'green';
        }
        return <Tag color={color}>{AUDIT_STATUS_MAP[v]}</Tag>;
      },
    },
  ];


  // 状态改变后重新搜索
  useEffect(() => {
    sendSearch();
  }, [status]);
  // 发起搜索请求
  function sendSearch(curPage?: number) {
    // 重置分页器
    const params = {
      searchKey,
      status,
    } as any;
    if (curPage) {
      params.page = curPage;
    };
    const temp = formatFormData(params);
    submit(temp, {
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
          <Table
            columns={columns}
            pagination={{
              total,
              current: page,
              pageSize: USER_PAGESIZE,
              onChange: sendSearch,
            }}
            dataSource={data as any}
          />
        </div>
      </div>
    </Spin>
  );
};
