import { json, LoaderFunction } from 'remix';
import React from 'react';
import HistoryComp from '~/components/order/history';
import { getSessionUserData, needLogined } from '~/utils/loginUtils';
import { db } from '~/utils/db.server';
import { OrderHistoryLoaderData } from '~/types';
// import { validateFormDatas } from '~/utils/server.index';
// import { DB_ERROR, NO_PERMISSION, PARAMS_ERROR } from '~/error';
// import { Order, OrderStatus } from '@prisma/client';
import { USER_PAGESIZE } from '~/const';

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
    take: USER_PAGESIZE,
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
    take: USER_PAGESIZE,
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

  // // 判断每个签约是否为等待中
  // // 如果target为自己，则看taegetNext是否为true，为true则为等待中
  // // 如果author为自己，则看author是否为true，为true则为等待中
  // const resTargetOrders = targetOrders.map((item) => {
  //   return {
  //     ...item,
  //     pendding: !!item.targetNext,
  //   };
  // });
  // const resAuthorOrders = authorOrders.map((item) => {
  //   return {
  //     ...item,
  //     pendding: !!item.authorNext,
  //   };
  // });
  const resData: OrderHistoryLoaderData = {
    targetOrders,
    authorOrders,
    page: +page,
    targetTotal: targetTotal,
    authorTotal: authorTotal,
    user: userData,
  };
  return json(resData);
};

export default function History() {
  return <HistoryComp />;
};


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
