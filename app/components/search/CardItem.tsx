import { Goods, User } from '@prisma/client';
import React from 'react';
import { RenderType } from '~/types/search';

export default function CardItem(props: { data: User | Goods, type: RenderType }) {
  const { data } = props;

  return (
    <div className="search-content-item">
      <img src="https://img.duotegame.com/article/contents/2021/06/11/2021061145744553.jpg" alt="xss" />
      <div className="search-content-item-text">
        <div className='item-name'>{data.name} <span>{data.tagId || '默认标签'}</span></div>
        <div className='item-info'>{data.introduce || '暂无简介'}</div>
      </div>
    </div>
  );
};
