import { OrderStatus } from '@prisma/client';
import React from 'react';
import { OrderJoinUser } from '~/types';

export default function TableActions(props: { status: OrderStatus, orderData: OrderJoinUser }) {
  const { status } = props;
  let renderBtn;
  // 不同状态渲染不同的按钮
  switch (status) {
    case OrderStatus.CONTRACTING: {
      break;
    }
  }

  return (
    <div>TableActions</div>
  );
}
