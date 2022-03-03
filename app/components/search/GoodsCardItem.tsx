import { Goods } from '@prisma/client';
import React from 'react';

export default function GoodsCardItem(props: { data: Goods }) {
  const { data } = props;

  return (
    <div className="search-content-item-goods">
      <img src="https://img.duotegame.com/article/contents/2021/06/11/2021061145744553.jpg" alt="xss" />
      <div className="search-content-item-text-goods">
        <div className='item-name'>{data.name} <span>{'默认标签'}</span></div>
        <div className='item-info'>{data.introduce || '暂无简介'}</div>
      </div>
    </div>
  );
};
