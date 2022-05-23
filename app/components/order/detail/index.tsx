import { OrderStatus, Role } from '@prisma/client';
import { Button, message, Popconfirm, Steps } from 'antd';
import axios from 'axios';
import React, { useState } from 'react';
import { useLoaderData, useSubmit } from 'remix';
import { ORDER_STATUS_MAP } from '~/const';
import { ERROR, OrderDetailLoaderData, OrderOpts, SUCCESS } from '~/types';
import { isAuthor, isPendding } from '~/utils/client.index';
import CheckingForm from './CheckingForm';
import DoingForm from './DoingForm';
import DoneForm from './DoneForm';

const { Step } = Steps;

export default function OrderDetail() {
  const loaderData: OrderDetailLoaderData = useLoaderData();
  const submit = useSubmit();
  const [resLoading, setResLoading] = useState(false);
  const { curUser, orderInfo } = loaderData;
  console.log('orderInfo', orderInfo);
  const { status, author, target, id } = orderInfo || {};
  // 不是签约的两个用户，后台会鉴权后转到/home
  // const isAuthor = curUser.id === authorId ? true : false;
  const pendding = isPendding(curUser, orderInfo);
  const [opts, setOpts] = useState({
    // 检验中
    expressNum: orderInfo?.expressNum || '',
    sysExpressNum: orderInfo?.sysExpressNum || '',
    expressType: orderInfo?.expressType || '',
    tips: orderInfo?.tips || '',
    // 直播中
    time: orderInfo?.time || null,
    // liveUrl: orderInfo?.liveUrl || '',
    // 已完成
    comment: orderInfo.userComment ? orderInfo.userComment[0]?.comment : '',
    rating: orderInfo.userComment ? orderInfo.userComment[0]?.rating : null,
    // 是发起人，那么fromId就是发起人的id，否则就是接收人的id
    fromId: isAuthor(curUser.id, orderInfo.authorId) ? orderInfo.authorId : orderInfo.targetId,
    // 是发起人，那么toId就是接收人的id，否则就是发起人的id
    toId: isAuthor(curUser.id, orderInfo.authorId) ? orderInfo.targetId : orderInfo.authorId,
  } as OrderOpts);
  const steps = [
    {
      title: '签约中',
      key: OrderStatus.CONTRACTING,
      content: null,
    },
    {
      title: '检验中',
      key: OrderStatus.CHECKING,
      tips: '请仔细检验货物质量',
      // 主播不能填写表单，所以如果当前角色为主播，则也禁止填写
      content: <CheckingForm disable={pendding || curUser.role === Role.ANCHOR} opts={opts} setOpts={setOpts} />,
    },
    {
      title: '直播中',
      key: OrderStatus.DOING,
      content: <DoingForm
        setOpts={setOpts}
        opts={opts}
        disable={pendding || curUser.role === Role.COMPANY} />,
    },
    {
      title: '已完成',
      key: OrderStatus.DONE,
      content: <DoneForm
        setOpts={setOpts}
        opts={opts}
        disable={pendding}
      />,
    },
    {
      title: '已取消',
      key: OrderStatus.REJECTED,
      content: <h3>签约已取消</h3>,
    },
  ];
  const current = steps.findIndex((item) => item.key === status);
  // 发送请求，进入下一步骤
  async function next(next: boolean) {
    setResLoading(true);
    // 先看下当前签约记录的状态有没有变，变了就提示刷新
    const checkRes: { data: OrderDetailLoaderData } = await axios.get(`/order/${id}?_data=routes/order/$orderId`);
    const { data: { orderInfo: checkOrderInfo } } = checkRes;
    if (checkOrderInfo.status !== status) {
      message.warn('签约状态有变更，页面刷新后再重新提交');
      submit({}, { method: 'get' });
      setResLoading(false);
      return;
    }
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

  let stepStatus = 'process';
  if (status === OrderStatus.REJECTING || status === OrderStatus.REJECTED) {
    stepStatus = 'error';
  }
  return (
    <>
      <h2>订单id: {orderInfo.id}</h2>
      <h2>{author.name} 向 {target.name} 发起的签约记录</h2>
      {(isAuthor(curUser.id, orderInfo.authorId) ? orderInfo.targetNext : orderInfo.authorNext) ? <h3>另一方已同意进入下一步</h3> : <h3>等待另一方同意进入下一步</h3>}
      {orderInfo.status === 'CHECKING' && (orderInfo.sysNext ? <h3>平台已通过</h3> : <h3>平台未通过（仅作用于检验中）</h3>)}
      <Steps current={current} status={stepStatus as any}>
        {steps.map((item) => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>
      <div className="steps-content">
        <h2>流程要点明细</h2>
        <p className='tips'>{ORDER_STATUS_MAP[steps[current].key].explain}</p>
        {steps[current].content}
      </div>
      <div className="steps-action">
        {current < steps.length - 1 && (
          <Popconfirm
            title="确定吗?"
            onConfirm={() => next(true)}
            disabled={pendding}
            okText="确定"
            cancelText="取消"
          >
            <Button
              disabled={pendding}
              loading={resLoading}
              type='primary'
            >{pendding ? '等待另一方确认' : (status === OrderStatus.DONE ? '提交评论' : '下一步')}</Button>
          </Popconfirm>
        )}
        <Popconfirm
          title="确定取消吗?"
          onConfirm={() => next(false)}
          disabled={status === OrderStatus.DONE || status === OrderStatus.REJECTED}
          okText="确定"
          cancelText="取消"
        >
          <Button
            style={{ marginLeft: 10 }}
            disabled={status === OrderStatus.DONE || status === OrderStatus.REJECTED}
            loading={resLoading}
            type='primary'
            danger
          >取消</Button>
        </Popconfirm>
      </div>
    </>
  );
}
