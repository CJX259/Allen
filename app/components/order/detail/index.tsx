import { OrderStatus } from '@prisma/client';
import { Button, message, Popconfirm, Steps } from 'antd';
import React, { useState } from 'react';
import { useLoaderData } from 'remix';
import { OrderDetailLoaderData } from '~/types';

const { Step } = Steps;

const steps = [
  {
    title: '签约中',
    key: OrderStatus.CONTRACTING,
    content: '是否已与该用户进行线下签约?',
  },
  {
    title: '检验中',
    key: OrderStatus.CHECKING,
    content: '请仔细检验货物质量',
  },
  {
    title: '直播中',
    key: OrderStatus.DOING,
    content: '请主播',
  },
  {
    title: '已完成',
    key: OrderStatus.DONE,
    content: '双方完成了自己的合同内容',
  },
];

export default function OrderDetail() {
  const loaderData: OrderDetailLoaderData = useLoaderData();
  const { curUser, orderInfo } = loaderData;
  // 是否为等待中
  const pendding = (orderInfo.authorNext && !orderInfo.targetNext) || (!orderInfo.authorNext && orderInfo.targetNext) || true;
  const [current, setCurrent] = useState();
  const [opts, setOpts] = useState({});
  console.log('loaderData', loaderData);
  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  return (
    <>
      <Steps current={current}>
        {steps.map((item) => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>
      <div className="steps-content">{steps[current].content}</div>
      <div className="steps-action">
        {current < steps.length - 1 && (
          <Popconfirm
            title="确定同意进入下一阶段吗？"
            onConfirm={() => next()}
            disabled={pendding}
            okText="确定"
            cancelText="取消"
          >
            <Button
              disabled={pendding}
              // loading={resLoading}
              type='primary'
            >{pendding ? '等待中' : '下一步'}</Button>
          </Popconfirm>
        )}
        {current === steps.length - 1 && (
          <Button type="primary" onClick={() => message.success('Processing complete!')}>
            Done
          </Button>
        )}
        {current > 0 && (
          <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
            Previous
          </Button>
        )}
      </div>
    </>
  );
}
