import React from 'react';
import { ColumnsType } from 'antd/lib/table';
import { useLoaderData } from 'remix';
import { Tabs, Table } from 'antd';
import { OrderHistoryLoaderData, OrderJoinUser } from '~/types';
import RoleTag from '../RoleTag';
import { ORDER_STATUS_MAP } from '~/const';
import { OrderStatus } from '@prisma/client';
import TableActions from './TableActions';

const { TabPane } = Tabs;

export default function HistoryComp() {
  const loaderData: OrderHistoryLoaderData = useLoaderData();
  const { targetOrders, authorOrders } = loaderData;
  console.log('data', targetOrders, authorOrders);
  // 表格列
  const columns: ColumnsType<any> = [
    {
      title: '发起人',
      dataIndex: ['author', 'name'],
      render: (v, record: OrderJoinUser) => <span>{v} <RoleTag role={record.authorRole} /></span>,
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
          </span>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (v, record: OrderJoinUser) => <TableActions status={record.status} orderData={record} />,
    },
  ];
  return (
    <div className='history-wrapper'>
      <Tabs defaultActiveKey="2" onChange={() => console.log('cahnge')}>
        <TabPane tab="收到的签约记录" key="1">
          <Table
            columns={columns}
            rowKey='id'
            dataSource={targetOrders}
          />
        </TabPane>
        <TabPane tab="发起的签合记录" key="2">
          <Table
            columns={columns}
            rowKey='id'
            dataSource={authorOrders}
          />
        </TabPane>
      </Tabs>
    </div>
  );
}
