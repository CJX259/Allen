import { ColumnsType } from 'antd/lib/table';
import { Table } from 'antd';
import React from 'react';
import { LiveDataItem, UserJoinTag } from '~/types';
import moment from 'moment';
import { TIME_FORMAT } from '~/const';
import { User } from '@prisma/client';
import { getRandom } from '~/utils';

export default function liveTable(props: { data: LiveDataItem[], user: UserJoinTag, loginUser: User; dev: boolean}) {
  const { data, user, loginUser, dev } = props;

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
      dataIndex: 'companyId',
      render(v: number, record: LiveDataItem) {
        return <span>{record.targetId === v ? record.target.name : record.author.name}</span>;
      },
    },
    {
      title: '直播时间',
      dataIndex: 'time',
      render(v: string) {
        console.log('moment', moment(+v).format(TIME_FORMAT));
        return <span>{moment(+v).format(TIME_FORMAT)}</span>;
      },
    },
    {
      title: '直播地址',
      dataIndex: 'liveUrl',
      render(v: any) {
        const random = getRandom(4);
        return <a
          href={`/player/index.html?sdkAppId=1400509104&secretKey=f200c81949c32392f6e43ebccf3d7f41a919fa9bb287375cc8909591745be5f7&expireTime=604800&roomId=${user.id}&roomName=${user.name}的直播间&anchorId=${user.id}&userId=${loginUser.id || random}&userName=${loginUser.name || ('游客' + random)}&playerDomain=${dev ? 'http://127.0.0.1' : 'webrtc.jessyblog.cn'}`}
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
