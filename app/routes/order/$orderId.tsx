import { json, LinksFunction, LoaderFunction, redirect } from 'remix';
import React from 'react';
import { DB_ERROR, PARAMS_ERROR } from '~/error';
import OrderDetail from '~/components/order/detail';
import detailStyle from '~/styles/css/orderDetail.css';
import { getSessionUserData, needLogined } from '~/utils/loginUtils';
import { db } from '~/utils/db.server';
import { OrderDetailLoaderData } from '~/types';

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: detailStyle }];
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

// 类似步骤条的ui
export default function Detail() {
  return <OrderDetail />;
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
