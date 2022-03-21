import { ColumnsType } from 'antd/lib/table';
import { Table } from 'antd';
import React from 'react';
import { LiveDataItem } from '~/types';

export default function liveTable(props: { data: LiveDataItem[]}) {
  const { data } = props;
  const columns: ColumnsType<any> = [
    {
      title: '主播',
      dataIndex: 'anchorId',
      render(v: number, record: LiveDataItem) {
        console.log('v', v, record);
        return <span>{record.targetId === v ? record.target.name : record.author.name}</span>;
      },
    },
    {
      title: '供应商',
      dataIndex: 'companId',
      render(v: number, record: LiveDataItem) {
        return <span>{record.targetId === v ? record.target.name : record.author.name}</span>;
      },
    },
    {
      title: '直播时间',
      dataIndex: 'time',
      render(v: string) {
        return <span>{v}</span>;
      },
    },
    {
      title: '直播地址',
      dataIndex: 'liveUrl',
      render(v: any) {
        return <a href={v} target="_blank" rel="noreferrer" >直播间</a>;
      },
    },
  ];
  return (
    <div className='live-table-wrapper'>
      <h2>直播信息</h2>
      <Table
        dataSource={data}
        columns={columns}
        pagination={false}
      />
    </div>
  );
}
