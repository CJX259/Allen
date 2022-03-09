import React from 'react';
import { ColumnsType } from 'antd/lib/table';
import { Link, useLoaderData, useSubmit, useTransition } from 'remix';
import { Tabs, Table, Tooltip, Spin } from 'antd';
import { OrderHistoryLoaderData, OrderJoinUser } from '~/types';
import { QuestionCircleOutlined } from '@ant-design/icons';
import RoleTag from '../RoleTag';
import { ORDER_STATUS_MAP, USER_PAGESIZE } from '~/const';
import { OrderStatus } from '@prisma/client';
import TableActions from './TableActions';

const { TabPane } = Tabs;

export default function HistoryComp() {
  const loaderData: OrderHistoryLoaderData = useLoaderData();
  const { targetOrders, authorOrders, page, targetTotal, authorTotal } = loaderData;
  const transition = useTransition();
  const submit = useSubmit();
  console.log('data', targetOrders, authorOrders);
  // 表格列
  const columns: ColumnsType<any> = [
    {
      title: '发起人',
      dataIndex: ['author', 'name'],
      render: (v, record: OrderJoinUser) => <>
        <Link to={`/info/${record.authorId}`}>{v}</Link>
        <RoleTag role={record.authorRole} />
      </>,
    },
    {
      title: '接收人',
      dataIndex: ['target', 'name'],
      render: (v, record: OrderJoinUser) => <span>{v} <RoleTag role={record.targetRole} /></span>,
    },
    {
      title: '签约状态',
      dataIndex: 'status',
      render: (v: OrderStatus) => {
        return (
          <span>
            {ORDER_STATUS_MAP[v].text}
            <Tooltip title={ORDER_STATUS_MAP[v].explain}>
              <QuestionCircleOutlined style={{ marginLeft: 10 }} />
            </Tooltip>
          </span>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (v, record: OrderJoinUser) => <TableActions page={'1'} status={record.status} orderData={record} />,
    },
  ];
  function sendSearch() {
    submit({ page: '1' }, { method: 'get' });
  }
  return (
    <div className='history-wrapper'>
      <Spin spinning={transition.state !== 'idle'}>
        <Tabs defaultActiveKey="1" onChange={() => console.log('cahnge')}>
          <TabPane tab="收到的签约记录" key="1">
            <Table
              columns={columns}
              rowKey='id'
              dataSource={targetOrders}
              pagination={{
                total: targetTotal,
                current: page,
                pageSize: USER_PAGESIZE,
                onChange: sendSearch,
              }}
            />
          </TabPane>
          <TabPane tab="发起的签合记录" key="2">
            <Table
              columns={columns}
              rowKey='id'
              dataSource={authorOrders}
              pagination={{
                total: authorTotal,
                current: page,
                pageSize: USER_PAGESIZE,
                onChange: sendSearch,
              }}
            />
          </TabPane>
        </Tabs>
      </Spin>
    </div>
  );
}
