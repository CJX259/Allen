import { Role } from '@prisma/client';
import { Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { LEVEL_VAR } from '~/const';
import Cos from 'cos-js-sdk-v5';
import { UserJoinTag } from '~/types';
import config from '~/../cloudConfig.json';

export default function UserCardItem(props: { data: UserJoinTag}) {
  const { data } = props;
  const [avatarUrl, setAvatarUrl] = useState(null as any);
  const roleText = data.role === Role.COMPANY ? <Tag color="red">供应商</Tag> : <Tag color="green">主播</Tag>;
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
  return (
    <div className="item-user">
      <div className="item-header">
        <img src={avatarUrl} alt="avatar" />
        <div className='item-name'>
          <div className="item-experience">LV {Math.ceil(data.experience / LEVEL_VAR)}</div>
          {data.name} {roleText}
          <div className="item-id">ID: {data.id}</div>
        </div>
        {/* 标签最多显示2个 */}
        <div className="item-tag">
          {data.tags?.slice(0, 2)?.map((item) => <Tag color='blue' key={item.tagId}>{item.tag.name}</Tag>)}
        </div>
      </div>
      <div className='item-info'>{data.introduce || '暂无简介'}</div>
    </div>
  );
};
