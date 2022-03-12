import { OrderStatus, Role } from '@prisma/client';
import { message, Modal, Popconfirm, Space } from 'antd';
import { Button } from 'antd';
import axios from 'axios';
import React, { useState } from 'react';
import { useSubmit } from 'remix';
import { ERROR, OrderJoinUserAndComment, SessionUserData, SUCCESS } from '~/types';
import ModalContent from './ModalContent';

export default function TableActions(props: { status: OrderStatus, orderData: OrderJoinUserAndComment, page: string, curUser: SessionUserData }) {
  const submit = useSubmit();
  const [resLoading, setResLoading] = useState(false);
  const [rejLoading, setRejLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  // 某些流程所需参数
  const [opts, setOpts] = useState({});
  const { status, page, orderData, curUser } = props;
  const { id } = orderData;
  // 渲染签约中按钮
  function renderBtn() {
    if (status === OrderStatus.DONE || status === OrderStatus.REJECTED) {
      // 已完成和已拒绝都显示订单已完成
      // 后续已完成状态时，可给用户评论
      return <span>订单已关闭</span>;
    }
    let nextWording = '下一步';
    // 主播且为完成中时，需要弹框填写直播信息
    if (status === OrderStatus.DOING && curUser.role === Role.ANCHOR) {
      nextWording = '填写直播信息';
    }
    return (
      <>
        <Space>
          <Popconfirm
            title="确定同意进入下一阶段吗？"
            onConfirm={() => onAgree()}
            disabled={orderData.pendding}
            okText="确定"
            cancelText="取消"
          >
            <Button
              disabled={orderData.pendding}
              loading={resLoading}
              type='primary'
            >{orderData.pendding ? '等待中' : nextWording}</Button>
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
        <Modal
          visible={visible}
          onCancel={initState}
          title="请输入必要信息"
          onOk={() => sendNextStep(true, opts)}
        >
          <ModalContent curUser={curUser} status={status} setOpts={setOpts} />
        </Modal>
      </>
    );
  };

  // 分状态弹出一些框补充信息，然后再发请求
  function onAgree(opts?: any) {
    setResLoading(true);
    // 检验中，完成中和已完成需要弹出框填写下一步信息
    if (status === OrderStatus.CHECKING || status === OrderStatus.DOING || status === OrderStatus.DONE) {
      setVisible(true);
    } else {
      sendNextStep(true, {});
    }
  }

  // 处理取消按钮逻辑
  function onReject() {

  }

  function initState() {
    setOpts({});
    setRejLoading(false);
    setResLoading(false);
    setVisible(false);
  }

  // 发送请求，进入下一步骤
  async function sendNextStep(next: boolean, params?: any) {
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

  return renderBtn();
}
