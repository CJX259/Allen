import { Role } from '@prisma/client';
import { Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { LEVEL_VAR, ROLE_MAP } from '~/const';
import Cos from 'cos-js-sdk-v5';
import { UserJoinTag } from '~/types';
import config from '~/../cloudConfig.json';
import { Link } from 'remix';

export default function UserCardItem(props: { data: UserJoinTag}) {
  const { data } = props;
  const [avatarUrl, setAvatarUrl] = useState(null as any);
  const color = data.role === Role.ANCHOR ? 'green' : 'red';
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
      <Link to={`/info/${data.id}`}>
        <div className="item-header">
          <img src={avatarUrl} alt="avatar" />
          <div className='item-name'>
            <div className="item-experience">LV {Math.ceil(data.experience / LEVEL_VAR)}</div>
            {data.name}
            <Tag style={{ marginLeft: 10 }} color={color}>{ROLE_MAP[data.role]}</Tag>
            <div className="item-id">ID: {data.id}</div>
          </div>
          {/* 标签最多显示2个 */}
          <div className="item-tag">
            {data.tags?.slice(0, 2)?.map((item) => <Tag color='blue' key={item.tagId}>{item.tag.name}</Tag>)}
          </div>
        </div>
        <div className='item-info'>{data.introduce || '暂无简介'}</div>
      </Link>
    </div>
  );
};
