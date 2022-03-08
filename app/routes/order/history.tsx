import { json, LoaderFunction } from 'remix';
import React from 'react';
import HistoryComp from '~/components/order/history';
import { getSessionUserData, needLogined } from '~/utils/loginUtils';
import { db } from '~/utils/db.server';
import { OrderHistoryLoaderData } from '~/types';

export const loader: LoaderFunction = async ({ request }) => {
  // 拉取历史签约记录
  const redirect = await needLogined(request);
  if (redirect) {
    return redirect;
  }
  const userData = await getSessionUserData(request);
  const proms = [];

  proms.push(db.order.findMany({
    where: {
      targetId: +userData.id,
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
    },
  }));
  proms.push(db.order.findMany({
    where: {
      authorId: +userData.id,
    },
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
  const [targetOrders, authorOrders] = await Promise.all(proms);
  const resData: OrderHistoryLoaderData = {
    targetOrders,
    authorOrders,
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
