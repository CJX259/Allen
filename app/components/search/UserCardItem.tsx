import { User } from '@prisma/client';
import React from 'react';
import { LEVEL_VAR } from '~/const';

export default function UserCardItem(props: {data: User}) {
  const { data } = props;

  return (
    <div className="search-content-item-user">
      <div className="item-header">
        <img src="https://img.duotegame.com/article/contents/2021/06/11/2021061145744553.jpg" alt="xss" />
        <div className='item-name'>
          <div className="item-experience">LV {Math.ceil(data.experience / LEVEL_VAR)}</div>
          {data.name}
        </div>
      </div>
      <div className='item-info'>{data.introduce || '暂无简介'}</div>
      <span className='item-tag'>{data.tagId || '默认标签'}</span>
    </div>
  );
};
