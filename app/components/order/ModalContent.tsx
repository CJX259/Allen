import { OrderStatus } from '@prisma/client';
import React from 'react';
import { SessionUserData } from '~/types';
import CheckingForm from './CheckingForm';
import DoingForm from './DoingForm';
import DoneForm from './DoneForm';

// 做状态分发的事情
export default function ModalContent(props: { setOpts: Function; status: OrderStatus, curUser: SessionUserData }) {
  const { status, setOpts, curUser } = props;
  // 检验中的下一步需要供应商填写物流单号、需要主播二次确认是否收到货并检查完货物质量，并做好拍照留底
  // 完成中的下一步需要主播填写直播时间，场次，直播链接等信息、待到直播结束7天后，供应商确认无误后可进入下一步到已完成
  let renderContent = <span>无需填写信息</span>;
  switch (status) {
    case OrderStatus.CHECKING: {
      renderContent = <CheckingForm curUser={curUser} setOpts={setOpts} />;
      break;
    }
    case OrderStatus.DOING: {
      renderContent = <DoingForm curUser={curUser} setOpts={setOpts} />;
      break;
    }
    case OrderStatus.DONE: {
      renderContent = <DoneForm curUser={curUser} setOpts={setOpts} />;
      break;
    }
  }
  return (
    <div>
      {renderContent}
    </div>
  );
}
