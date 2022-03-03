import { Role, User } from '@prisma/client';
import React from 'react';
import { LEVEL_VAR } from '~/const';

export default function UserCardItem(props: {data: User}) {
  const { data } = props;
  const roleText = data.role === Role.COMPANY ? '供应商' : '主播';
  return (
    <div className="search-content-item-user">
      <div className="item-header">
        <img src="https://img.duotegame.com/article/contents/2021/06/11/2021061145744553.jpg" alt="xss" />
        <div className='item-name'>
          <div className="item-experience">LV {Math.ceil(data.experience / LEVEL_VAR)}</div>
          {data.name}【{roleText}】
        </div>
        {/* 标签最多显示2个 */}
        <span className='item-tag'>{'默认标签sdasdas'}</span>
        <span className='item-tag'>{'默认标签sdasdas'}</span>
      </div>
      <div className='item-info'>{data.introduce || '暂无简介'}</div>
    </div>
  );
};
