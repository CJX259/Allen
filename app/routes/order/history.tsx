import { ActionFunction, json, LoaderFunction } from 'remix';
import React from 'react';
import HistoryComp from '~/components/order/history';
import { getSessionUserData, needLogined } from '~/utils/loginUtils';
import { db } from '~/utils/db.server';
import { NextStepParams, OrderHistoryLoaderData, SUCCESS } from '~/types';
import { validateFormDatas } from '~/utils/server.index';
import { DB_ERROR, NO_PERMISSION, PARAMS_ERROR } from '~/error';
import { Order, OrderStatus } from '@prisma/client';
import { ORDER_STATUS_SEQUENCE, USER_PAGESIZE } from '~/const';

// 分页拉历史记录数据
export const loader: LoaderFunction = async ({ request }) => {
  // 拉取历史签约记录
  const redirect = await needLogined(request);
  if (redirect) {
    return redirect;
  }
  const userData = await getSessionUserData(request);
  const searchParams = new URL(request.url).searchParams;


  const page = searchParams.get('page') || '1';
  const proms = [];

  proms.push(db.order.findMany({
    where: {
      targetId: +userData.id,
    },
    skip: (+page - 1) * USER_PAGESIZE,
    include: {
      author: {
        select: {
          name: true,
        },
      },
      target: {
        select: {
          name: true,
        },
      },
    },
  }));
  proms.push(db.order.findMany({
    where: {
      authorId: +userData.id,
    },
    skip: (+page - 1) * USER_PAGESIZE,
    include: {
      author: {
        select: {
          name: true,
        },
      },
      target: {
        select: {
          name: true,
        },
      },
    },
  }));
  const promsTotal = [];
  promsTotal.push(db.order.count({
    where: {
      targetId: +userData.id,
    },
  }));
  promsTotal.push(db.order.count({
    where: {
      authorId: +userData.id,
    },
  }));
  const [targetOrders, authorOrders] = await Promise.all(proms);
  const [targetTotal, authorTotal] = await Promise.all(promsTotal);

  // 判断每个签约是否为等待中
  // 如果target为自己，则看taegetNext是否为true，为true则为等待中
  // 如果author为自己，则看author是否为true，为true则为等待中
  const resTargetOrders = targetOrders.map((item) => {
    return {
      ...item,
      pendding: !!item.targetNext,
    };
  });
  const resAuthorOrders = authorOrders.map((item) => {
    return {
      ...item,
      pendding: !!item.authorNext,
    };
  });
  const resData: OrderHistoryLoaderData = {
    targetOrders: resTargetOrders,
    authorOrders: resAuthorOrders,
    page: +page,
    targetTotal: targetTotal,
    authorTotal: authorTotal,
  };
  return json(resData);
};

// 处理流程
export const action: ActionFunction = async ({request}) => {
  const redirect = await needLogined(request);
  if (redirect) {
    return redirect;
  }
  const sessionUserData = await getSessionUserData(request);
  const payload = await request.json() as { status: OrderStatus, next: boolean } & Order;
  const requireKeys = ['status', 'next', 'id'];
  const { status, next, id } = payload;
  if (!validateFormDatas(requireKeys, payload)) {
    return json(PARAMS_ERROR);
  };
  const curOrder = await db.order.findUnique({
    where: {
      id,
    },
  });
  if (!curOrder) {
    return json(PARAMS_ERROR);
  }
  const { authorId, targetId, authorNext, targetNext } = curOrder;
  // 判断当前操作者属于发起者还是接受者
  const isAuthor = judgeIsAuthor(sessionUserData.id, targetId, authorId);
  if (isAuthor === null) {
    return json(NO_PERMISSION);
  }

  // 没有next，就是拒绝/取消
  if (!next) {
    // 如果已经为取消中，再传next = false即为拒绝取消，回到正常状态
    if ( status === OrderStatus.REJECTING) {
      // 回到上一步
    } else {
      // 原本为正常状态，则应该转为取消中，并把xxxnext设为true，等待答复
    }
  } else {
    // next为true则按着流程走，无论是取消中还是正常流程(因为取消中也是传next=true同意的)
    return await nextStep({ id, isAuthor, status, targetNext, authorNext });
  }
  return null;
};

export default function History() {
  return <HistoryComp />;
};


/**
 * 双方同意，进入下一阶段
 *
 * @param {NextStepParams} data
 * @return {*}
 */
async function nextStep(data: NextStepParams) {
  const { isAuthor, id, targetNext, status, authorNext, opts = {} } = data;
  const nextStatus = ORDER_STATUS_SEQUENCE[status].next;
  if (!nextStatus) {
    // 已是最后阶段
    return json({ success: true });
  }
  console.log('isAuthor', isAuthor, targetNext, authorNext);
  if ((isAuthor && targetNext) || (!isAuthor && authorNext)) {
    // 清掉同意记录，进入下一阶段
    console.log('进入下一阶段');
    try {
      const updateOrder = await db.order.update({
        where: {
          id,
        },
        data: {
          authorNext: false,
          targetNext: false,
          status: nextStatus,
          // 再把其他阶段所需信息传入
          ...opts,
        },
      });
      return json({
        order: { ...updateOrder},
        success: true,
      } as SUCCESS);
    } catch (error) {
      console.log('error', error);
      return json(DB_ERROR);
    };
  } else {
    // 另一方未确认，进入等待状态
    try {
      const temp = isAuthor ? { authorNext: true, ...opts } : { targetNext: true, ...opts };
      const updateOrder = await db.order.update({
        where: {
          id,
        },
        data: temp,
      });
      console.log('updateOrder', updateOrder);
      return json({
        order: { ...updateOrder},
        success: true,
      } as SUCCESS);
    } catch (error) {
      return json(DB_ERROR);
    }
  }
}

// 其中一方拒绝，返回上一阶段


/**
 * 判断当前用户是否为发起人
 *
 * @param {string} sessionUserId
 * @param {string} targetId
 * @param {string} authorId
 * @return {*}
 */
function judgeIsAuthor(sessionUserId: number, targetId: number, authorId: number) {
  if (sessionUserId === targetId) {
    return false;
  } else if (sessionUserId === authorId) {
    return true;
  } else {
    return null;
  }
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return (
    <div>
      <h1>500</h1>
      <h2>服务器出错</h2>
      <h3>{error.message}</h3>
    </div>
  );
};
