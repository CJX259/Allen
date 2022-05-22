import { Order, OrderStatus } from '@prisma/client';
import { Button, message, Popconfirm, Space, Spin, Table, Tag, Tooltip } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import axios from 'axios';
import React, { useState } from 'react';
import { Link, useLoaderData, useSubmit, useTransition } from 'remix';
import { ORDER_STATUS_MAP, USER_PAGESIZE } from '~/const';
import { AuditOrderLoader, ERROR, OrderJoinAnchorAndCompany, SUCCESS } from '~/types';
import { formatFormData } from '~/utils/client.index';
import SearchInput from '../SearchInput';

export default function AuditOrderComp() {
  const transition = useTransition();
  const submit = useSubmit();
  const loaderData: AuditOrderLoader = useLoaderData();
  const [auditLoading, setAuditLoading] = useState(false);
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
      render: (v, record: OrderJoinAnchorAndCompany) => <Link to={`/info/${v}`}>{record.anchor.name}</Link>,
    },
    {
      title: '供应商',
      dataIndex: 'companyId',
      key: 'companyId',
      render: (v, record: OrderJoinAnchorAndCompany) => <Link to={`/info/${v}`}>{record.company.name}</Link>,
    },
    {
      title: '签约状态',
      dataIndex: 'status',
      key: 'status',
      render: (v: OrderStatus) => ORDER_STATUS_MAP[v].text,
    },
    {
      title: '平台审核',
      dataIndex: 'sysNext',
      key: 'sysNext',
      render: (v: boolean) => <Tag color={v ? 'green' : 'warning' }>{v ? '平台已通过' : '平台未通过'}</Tag>,
    },
    {
      title: '快递单号',
      dataIndex: 'sysExpressNum',
      key: 'sysExpressNum',
      // width: 350,
      render: (v) => <Tooltip title={v}>{v}</Tooltip>,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      // width: 350,
      render: (value: Order, record: Order, index: number) => {
        if (!data) {
          return null;
        }
        return (
          <Space>
            <Popconfirm
              title="确定通过吗？"
              okText="确定"
              cancelText="取消"
              onConfirm={() => sendChecked(record.id, true)}
            >
              <Button type='primary' loading={auditLoading}>检验通过</Button>
            </Popconfirm>
            <Popconfirm
              title="取消签约订单吗？"
              okText="确定"
              cancelText="取消"
              onConfirm={() => sendChecked(record.id, false)}
            >
              <Button type='primary' danger loading={auditLoading}>检验不通过</Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];
  // 平台校验通过
  async function sendChecked(id: number, next: boolean) {
    setAuditLoading(true);
    const res = await axios.post('/auditOrder?_data=routes/auditOrder', {
      id,
      next,
    });
    setAuditLoading(false);
    const data: SUCCESS & ERROR = res.data;
    if (data.success) {
      message.success('操作成功');
      // 更新页面data(要校验下更新的传参有无问题)
      submit({}, { method: 'get' });
    } else {
      message.error(data.msg);
    }
  }

  // 发起表格搜索
  function sendSearch(page: number) {
    // 重置分页器
    const params = {
      searchKey: key,
      page,
    } as any;
    const temp = formatFormData(params);
    submit(temp, {
      method: 'get',
    });
  }
  return (
    <Spin spinning={transition.state !== 'idle'}>
      <div className="audit-wrapper">
        {/* 搜索框区域 */}
        <SearchInput placehold="请输入订单ID搜索" defaultKey={key} sendSearch={() => sendSearch(1)} setSearchKey={setSearchKey} />
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

