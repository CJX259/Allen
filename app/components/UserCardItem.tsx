import { Space, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { LEVEL_VAR, TIME_FORMAT_CARD } from '~/const';
import Cos from 'cos-js-sdk-v5';
import { UserJoinTag } from '~/types';
import config from '~/../cloudConfig.json';
import { Link } from 'remix';
import RoleTag from './RoleTag';
import moment from 'moment';
import { renderPlayerUrl } from '~/utils';
import { User } from '@prisma/client';

export default function UserCardItem(props: { data: UserJoinTag & { time?: number }; jumpRoom?: boolean; curUser?: User | null; dev?: boolean}) {
  const { data, jumpRoom, curUser, dev = true } = props;
  const [avatarUrl, setAvatarUrl] = useState(null as any);
  useEffect(() => {
    const cos = new Cos({
      SecretId: config.SecretId,
      SecretKey: config.SecretKey,
    });
    cos.getObjectUrl({
      Bucket: 'sls-cloudfunction-ap-guangzhou-code-1301421790',
      Region: 'ap-guangzhou',
      Key: config.prefix + data.avatarKey as string,
    }, function(err, data) {
      if (err) {
        console.log(err);
        return;
      }
      setAvatarUrl(data.Url);
    });
  }, [data.avatarKey]);
  function renderContent() {
    return (
      <>
        <div className="item-header">
          <img src={avatarUrl} alt="avatar" />
          <div className='item-name'>
            <div className="item-experience">LV {Math.ceil(data.experience / LEVEL_VAR)}</div>
            {data.name}
            <RoleTag role={data.role} />
            <div className="item-id">ID: {data.id}</div>
          </div>
          {/* 标签最多显示2个 */}
          <div className="item-tag">
            {data.tags?.slice(0, 2)?.map((item) => <Tag color='blue' key={item.tagId}>{item.tag.name}</Tag>)}
          </div>
        </div>
        <div className='item-info'>{data.introduce || '暂无简介'}</div>
        {data.time &&
          <div className='item-time'>
            <span>开播时间: {moment(data.time * 1000).format(TIME_FORMAT_CARD)}</span>
          </div>
        }
        <div className="item-detail">
          <Space>
            <div className="item-detail-comment">平均评分: {data.avgRating?.toFixed(1) || '无'}</div>
            <div className="item-detail-count">总签约数: {data.orderCount || '无'}</div>
          </Space>
        </div>
      </>
    );
  }
  return (
    <div className="item-user">
      {jumpRoom ?
        <a
          target="_blank" rel="noreferrer"
          href={renderPlayerUrl({
            secretKey: config.secretKey,
            sdkAppId: config.sdkAppId,
            playerDomain: config.playerDomain,
            expireTime: config.expireTime,
            anchorId: data.id,
            anchorName: data.name,
            userId: curUser?.id,
            userName: curUser?.name,
            dev,
          })}>
          {renderContent()}
        </a>:
        <Link to={`/info/${data.id}`}>
          {renderContent()}
        </Link>
      }
    </div>
  );
};
