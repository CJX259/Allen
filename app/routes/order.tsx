import { ActionFunction, json, Outlet, redirect } from 'remix';
import React from 'react';
import { LoginKey, REQ_METHOD } from '~/const';
import { getFromDatas, validateFormDatas } from '~/utils/server.index';
import { PARAMS_ERROR } from '~/error';
import { db } from '~/utils/db.server';
import { OrderStatus } from '@prisma/client';
import { needLogined } from '~/utils/loginUtils';
import { getSession } from '~/sessions';
import { SessionUserData } from '~/types';

// 处理发起order请求
export const action: ActionFunction = async ({ request }) => {
  // 需要登录
  const redirect = await needLogined(request);
  if (redirect) {
    return redirect;
  }
  // 获取session
  const session = await getSession(request.headers.get('Cookie'));
  const loginUser = session.get(LoginKey);
  const method = request.method;
  const rowFormData = await request.formData();
  switch (method) {
    // post为新建
    case REQ_METHOD.POST: {
      return handleCreateOrder(rowFormData, loginUser);
    }
    // put为更新至下一流程
    case REQ_METHOD.PUT: {
      break;
    }
    // del为取消
    case REQ_METHOD.DEL: {
      break;
    }
  }
  return null;
};


export default function Order() {
  return <Outlet />;
};


// 新建签约订单
async function handleCreateOrder(rowFormData: FormData, loginUser: SessionUserData) {
  const keys = ['targetId', 'targetRole'];
  const formData = getFromDatas(keys, rowFormData);
  // 校验参数，不存在则返回
  if (!validateFormDatas(keys, formData)) {
    return json(PARAMS_ERROR);
  }
  const { targetId, targetRole } = formData;
  const newOrder = await db.order.create({
    data: {
      authorId: loginUser.id,
      authorRole: loginUser.role,
      authorNext: true,
      targetId: +targetId,
      targetRole,
      status: OrderStatus.CONTRACTING,
    },
  });
  console.log('发起签约记录', newOrder);
  return redirect(`/order/${newOrder.id}`);
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
