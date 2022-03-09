import { OrderStatus } from '@prisma/client';
import { message, Popconfirm, Space } from 'antd';
import { Button } from 'antd';
import axios from 'axios';
import React, { useState } from 'react';
import { useSubmit } from 'remix';
import { ERROR, OrderJoinUser, SUCCESS } from '~/types';

export default function TableActions(props: { status: OrderStatus, orderData: OrderJoinUser, page: string }) {
  const submit = useSubmit();
  const [resLoading, setResLoading] = useState(false);
  const [rejLoading, setRejLoading] = useState(false);
  const { status, page, orderData } = props;
  const { id } = orderData;
  let renderBtn;

  // 渲染签约中按钮
  function renderContractiongBtn() {
    return (
      <Space>
        <Popconfirm
          title="确定同意进入下一阶段吗？"
          onConfirm={() => onAgree()}
          okText="确定"
          cancelText="取消"
        >
          <Button
            loading={resLoading}
            type='primary'
          >同意</Button>
        </Popconfirm>
        <Popconfirm
          title="确定（发起取消订单/拒绝进入下一阶段）吗"
          onConfirm={() => onReject()}
          okText="确定"
          cancelText="取消"
        >
          <Button
            loading={rejLoading}
            type='primary'
            danger
          >拒绝/取消
          </Button>
        </Popconfirm>
      </Space>
    );
  };

  // 分状态弹出一些框补充信息，然后再发请求
  function onAgree() {
    // 先简单发一个请求
    setResLoading(true);
    sendNextStep(true, {});
  }

  // 处理取消按钮逻辑
  function onReject() {

  }

  // 发送请求，同意，进入下一步骤
  async function sendNextStep(next: boolean, params?: any) {
    // submit({}, {
    //   method: 'post',
    // });
    const baseParams = {
      status,
      // next为true代表进入下一阶段，false代表取消或拒绝取消
      next,
      id,
    };

    // 使用axios发送，因为使用submit，页面数据无法及时刷新，axios可以在拿到响应结果后调用submit请求loader
    const res: SUCCESS & ERROR = await axios.post('/order/history?_data=routes/order/history', {
      ...baseParams,
      ...params,
    });
    if (res.data.success) {
      message.success('操作成功');
      submit({
        page,
      }, {method: 'get'});
    } else {
      message.error('操作失败');
    }
    setRejLoading(false);
    setResLoading(false);
  };

  // 不同状态渲染不同的按钮
  switch (status) {
    case OrderStatus.CONTRACTING: {
      renderBtn = renderContractiongBtn();
      break;
    }
  }

  return (
    <div>{renderBtn}</div>
  );
}
