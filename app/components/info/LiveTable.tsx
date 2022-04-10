import { ColumnsType } from 'antd/lib/table';
import { Table } from 'antd';
import React from 'react';
import { LiveDataItem } from '~/types';
import moment from 'moment';
import { TIME_FORMAT } from '~/const';
import { Role, User } from '@prisma/client';
import { getRandom, renderPlayerUrl } from '~/utils';
import CloudConfig from '~/../cloudConfig.json';

export default function liveTable(props: { data: LiveDataItem[], loginUser: User; dev: boolean}) {
  const { data, loginUser, dev } = props;
  const columns: ColumnsType<any> = [
    {
      title: '主播',
      render(v: number, record: LiveDataItem) {
        // target是不是主播，是主播，就展示它的名称，不是则展示发起人的名称
        return <span>{record.target.role === Role.ANCHOR ? record.target.name : record.author.name}</span>;
      },
    },
    {
      title: '供应商',
      render(v: number, record: LiveDataItem) {
        // target是不是供应商，是供应商，就展示它的名称，不是则展示发起人的名称
        return <span>{record.target.role === Role.COMPANY ? record.target.name : record.author.name}</span>;
      },
    },
    {
      title: '直播时间',
      dataIndex: 'time',
      render(v: number) {
        return <span>{moment(v * 1000).format(TIME_FORMAT)}</span>;
      },
    },
    {
      title: '直播地址',
      // dataIndex: 'liveUrl',
      render(v: any, record: LiveDataItem) {
        const random = getRandom(4);
        const targetIsAnchor = record.target.role === Role.ANCHOR;
        return <a
          href={renderPlayerUrl({
            secretKey: CloudConfig.secretKey,
            sdkAppId: CloudConfig.sdkAppId,
            playerDomain: CloudConfig.playerDomain,
            expireTime: CloudConfig.expireTime,
            anchorId: targetIsAnchor ? record.targetId : record.authorId,
            anchorName: targetIsAnchor ? record.target.name : record.author.name,
            userId: loginUser?.id,
            userName: loginUser?.name,
            dev,
          })}
          target="_blank" rel="noreferrer" >直播间</a>;
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
