import { ActionFunction, json, LinksFunction, LoaderFunction, redirect } from 'remix';
import React from 'react';
import { DB_ERROR, NO_PERMISSION, PARAMS_ERROR } from '~/error';
import OrderDetail from '~/components/order/detail';
import detailStyle from '~/styles/css/orderDetail.css';
import { getSessionUserData, needLogined } from '~/utils/loginUtils';
import { db } from '~/utils/db.server';
import { NextStepParams, OrderDetailLoaderData, OrderOpts, SUCCESS } from '~/types';
import { Order, OrderStatus } from '@prisma/client';
import { formatOpts, validateFormDatas } from '~/utils/server.index';
import { ORDER_STATUS_SEQUENCE } from '~/const';
import { addExperience } from '~/server/user';

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: detailStyle }];
};


// 类似步骤条的ui
export default function Detail() {
  return <OrderDetail />;
};


export const loader: LoaderFunction = async ({ request, params }) => {
  const red = await needLogined(request);
  if (red) {
    return red;
  }
  const userData = await getSessionUserData(request);
  const { orderId } = params;
  if (!orderId) {
    return json(PARAMS_ERROR);
  }
  try {
    const orderInfo = await db.order.findUnique({
      where: {
        id: +orderId,
      },
      include: {
        author: {
          select: {
            name: true,
            role: true,
          },
        },
        target: {
          select: {
            name: true,
            role: true,
          },
        },
        userComment: {
          where: {
            fromId: userData.id,
          },
          select: {
            fromId: true,
            toId: true,
            orderId: true,
            rating: true,
            comment: true,
          },
        },
      },
    });
    // 如果不包含该用户的订单，则无权访问
    if (userData.id !== orderInfo?.authorId && userData.id !== orderInfo?.targetId) {
      console.log('id', userData.id, orderInfo?.authorId, orderInfo?.targetId);
      return redirect('/home');
    }
    return { orderInfo, curUser: userData } as OrderDetailLoaderData;
  } catch (error: any) {
    return json(DB_ERROR);
  }
};


// 处理流程
export const action: ActionFunction = async ({request, params}) => {
  const redirect = await needLogined(request);
  if (redirect) {
    return redirect;
  }
  const sessionUserData = await getSessionUserData(request);
  const { orderId } = params;
  if (!orderId) {
    return json(PARAMS_ERROR);
  }
  const payload = await request.json() as { status: OrderStatus, next: boolean, opts: OrderOpts } & Order;
  const requireKeys = ['status', 'next'];
  const { status, opts } = payload;
  if (!validateFormDatas(requireKeys, payload)) {
    return json(PARAMS_ERROR);
  };
  const curOrder = await db.order.findUnique({
    where: {
      id: +orderId,
    },
  });
  if (!curOrder) {
    return json(PARAMS_ERROR);
  }
  const { authorId, targetId, authorNext, targetNext } = curOrder;
  // 判断当前操作者属于发起者还是接受者
  const isAuthor = judgeIsAuthor(sessionUserData.id, targetId, authorId);
  // 无关人员，重定向
  if (isAuthor === null) {
    return json(NO_PERMISSION);
  }
  // return await nextStep({ id: +orderId, isAuthor, status, targetNext, authorNext, opts });

  // 没有next，就是拒绝/取消
  if (payload.next === false) {
    return await handleCancel(+orderId);
  } else {
    // next为true则按着流程走，无论是取消中还是正常流程(因为取消中也是传next=true同意的)
    return await nextStep({ id: +orderId, isAuthor, status, targetNext, authorNext, opts, authorId, targetId });
  }
};


/**
 * 双方同意，进入下一阶段
 *
 * @param {NextStepParams} data
 * @return {*}
 */
async function nextStep(data: NextStepParams) {
  console.log('next');
  const { isAuthor, id, targetNext, status, authorNext, opts, authorId, targetId } = data;
  const nextStatus = ORDER_STATUS_SEQUENCE[status].next;
  if (!nextStatus) {
    // 已是最后阶段,处理评论,登记经验值
    const { comment, rating, fromId, toId } = opts;
    const upsertComment = await db.userComment.upsert({
      where: {
        orderId_fromId_toId: {
          orderId: id,
          fromId,
          toId,
        },
      },
      create: {
        fromId,
        toId,
        orderId: id,
        comment,
        rating,
      },
      update: {
        comment,
        rating,
      },
    });
    console.log('upsert', upsertComment);
    return json({ success: true });
  }
  if ((isAuthor && targetNext) || (!isAuthor && authorNext)) {
    if (status === OrderStatus.DOING) {
      // 如果是完成中，则双方同意时，需要给双方都加上经验值
      addExperience(authorId, targetId);
    }
    // 清掉同意记录，进入下一阶段
    try {
      // 在opts中只提取出Order表里的字段
      const newOpts = formatOpts(opts);
      console.log('newOpts', newOpts);
      const updateOrder = await db.order.update({
        where: {
          id,
        },
        data: {
          authorNext: false,
          targetNext: false,
          status: nextStatus,
          // 再把其他阶段所需信息传入
          ...newOpts,
        },
      });
      console.log('update', updateOrder);
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
      // 在opts中只提取出Order表里的字段
      const newOpts = formatOpts(opts);
      console.log('newOpts', newOpts);
      const temp = isAuthor ? { authorNext: true, ...newOpts } : { targetNext: true, ...newOpts };
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
    } catch (error: any) {
      console.log('error', error.message);
      return json(DB_ERROR);
    }
  }
}

// 直接取消
async function handleCancel(id: number) {
  try {
    const resOrder = await db.order.update({
      where: {
        id,
      },
      data: {
        status: OrderStatus.REJECTED,
      },
    });
    return json({
      success: true,
      order: resOrder,
    } as SUCCESS);
  } catch (error: any) {
    console.log('err', error.message);
  }
}


/**
 * 判断当前用户是否为发起人(服务端的判断，可能有其他用户)
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
