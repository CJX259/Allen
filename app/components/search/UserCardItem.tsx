import { Role } from '@prisma/client';
import { Tag } from 'antd';
import React from 'react';
import { LEVEL_VAR } from '~/const';
import { UserJoinTag } from '~/types';

export default function UserCardItem(props: { data: UserJoinTag}) {
  const { data } = props;
  const roleText = data.role === Role.COMPANY ? <Tag color="red">供应商</Tag> : <Tag color="green">主播</Tag>;
  return (
    <div className="search-content-item-user">
      <div className="item-header">
        <img src="https://p3-pc.douyinpic.com/aweme/100x100/aweme-avatar/tos-cn-i-0813_2867fc0f3cee407eb98115f7ee4b068c.jpeg?from=2956013662" alt="xss" />
        <div className='item-name'>
          <div className="item-experience">LV {Math.ceil(data.experience / LEVEL_VAR)}</div>
          {data.name} {roleText}
        </div>
        {/* 标签最多显示2个 */}
        <div className="item-tag">
          {data.tags.slice(0, 2)?.map((item) => <Tag color='blue' key={item.tagId}>{item.tag.name}</Tag>)}
        </div>
      </div>
      <div className='item-info'>{data.introduce || '暂无简介'}</div>
    </div>
  );
};
