import { OrderStatus, Role } from '@prisma/client';
import { Button, message, Popconfirm, Steps } from 'antd';
import axios from 'axios';
import React, { useState } from 'react';
import { useLoaderData, useSubmit } from 'remix';
import { ERROR, OrderDetailLoaderData, OrderOpts, SUCCESS } from '~/types';
import { isPendding } from '~/utils/client.index';
import CheckingForm from './CheckingForm';

const { Step } = Steps;

export default function OrderDetail() {
  const loaderData: OrderDetailLoaderData = useLoaderData();
  const submit = useSubmit();
  const [resLoading, setResLoading] = useState(false);
  const { curUser, orderInfo } = loaderData;
  const { status, author, target, id } = orderInfo;
  // 不是签约的两个用户，后台会鉴权后转到/home
  // const isAuthor = curUser.id === authorId ? true : false;
  const pendding = isPendding(curUser, orderInfo);
  const [opts, setOpts] = useState({} as OrderOpts);
  const steps = [
    {
      title: '签约中',
      key: OrderStatus.CONTRACTING,
      tips: '是否已与该用户进行线下签约?',
      content: null,
    },
    {
      title: '检验中',
      key: OrderStatus.CHECKING,
      tips: '请仔细检验货物质量',
      // 主播不能填写表单，所以如果当前角色为主播，则也禁止填写
      content: <CheckingForm disable={pendding || curUser.role === Role.ANCHOR} opts={{
        expressNum: orderInfo.expressNum || '',
        expressType: orderInfo.expressType || '',
        tips: orderInfo.tips || '',
      }} setOpts={setOpts} curUser={curUser} />,
    },
    {
      title: '直播中',
      key: OrderStatus.DOING,
      tips: '请主播',
    },
    {
      title: '已完成',
      key: OrderStatus.DONE,
      tips: '双方完成了自己的合同内容',
    },
    {
      title: '取消中',
      key: OrderStatus.REJECTING as any,
      tips: '签约取消中，请双方确认同意',
    },
  ];
  const current = steps.findIndex((item) => item.key === status);
  // 发送请求，进入下一步骤
  async function next(next: boolean) {
    setResLoading(true);
    const baseParams = {
      status,
      // next为true代表进入下一阶段，false代表取消或拒绝取消
      next,
      id,
    };

    // 使用axios发送，因为使用submit，页面数据无法及时刷新，axios可以在拿到响应结果后调用submit请求loader
    const res: SUCCESS & ERROR = await axios.post(`/order/${id}?_data=routes/order/$orderId`, {
      ...baseParams,
      opts,
    });
    if (res.data.success) {
      message.success('操作成功');
      submit({}, { method: 'get' });
    } else {
      message.error('操作失败');
    }
    setResLoading(false);
  };

  const prev = () => {
  };

  let stepStatus = 'process';
  if (status === OrderStatus.REJECTING || status === OrderStatus.REJECTED) {
    stepStatus = 'error';
  }
  return (
    <>
      <h2>{author.name} 向 {target.name} 发起的签约记录</h2>
      <Steps current={current} status={stepStatus as any}>
        {steps.map((item) => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>
      <div className="steps-content">{steps[current].content}</div>
      <div className="steps-action">
        {current < steps.length - 1 && (
          <Popconfirm
            title="确定同意进入下一阶段吗？"
            onConfirm={() => next(true)}
            disabled={pendding}
            okText="确定"
            cancelText="取消"
          >
            <Button
              disabled={pendding}
              loading={resLoading}
              type='primary'
            >{pendding ? '等待另一方确认' : '下一步'}</Button>
          </Popconfirm>
        )}
        <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
          取消
        </Button>
      </div>
    </>
  );
}
