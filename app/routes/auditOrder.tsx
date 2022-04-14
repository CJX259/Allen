import { OrderStatus, Role } from '@prisma/client';
import React from 'react';
import { ActionFunction, json, LinksFunction, LoaderFunction } from 'remix';
import AuditOrderComp from '~/components/auditOrder';
import { USER_PAGESIZE } from '~/const';
import { AuditOrderLoader } from '~/types';
import { needLogined } from '~/utils/loginUtils';
import { transformNullAndUndefined, validateFormDatas } from '~/utils/server.index';
import style from '~/styles/css/auditOrder.css';
import { DB_ERROR, PARAMS_ERROR } from '~/error';
import { searchOrderByPage, SearchParams } from '~/server/order';
import { handleCancel } from './order/$orderId';
import { db } from '~/utils/db.server';

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: style }];
};

export const loader: LoaderFunction = async ({ request }) => {
  const redirectRes = await needLogined(request, [Role.ADMIN]);
  if (redirectRes) {
    return redirectRes;
  }
  // 按搜索条件，分页查询用户
  const searchParams = new URL(request.url).searchParams;
  let searchKey = searchParams.get('searchKey');
  // 避免转化时转为字符undefined or null
  searchKey = transformNullAndUndefined(searchKey);
  const numReg = /^\d*$/;
  if (searchKey && !numReg.test(searchKey)) {
    return json(PARAMS_ERROR);
  }
  const page = +(searchParams.get('page') || 1);
  const pageSize = +(searchParams.get('pageSize') || USER_PAGESIZE);
  const res: AuditOrderLoader = {
    searchKey,
    data: null,
    total: 0,
    page,
  };
  const params = {
    status: OrderStatus.CHECKING,
  } as SearchParams;

  if (searchKey) {
    params.id = +searchKey;
  }
  const { data, total } = await searchOrderByPage(params, page, pageSize);
  res.data = data;
  res.total = total;
  return res;
};

export default function AuditOrder() {
  return <AuditOrderComp />;
};

// 处理流程
export const action: ActionFunction = async ({request, params}) => {
  const redirect = await needLogined(request, [Role.ADMIN]);
  if (redirect) {
    return redirect;
  }
  const payload = await request.json() as { id: number; next: boolean };
  const requireKeys = ['id', 'next'];
  if (!validateFormDatas(requireKeys, payload)) {
    return json(PARAMS_ERROR);
  };
  const { id, next } = payload;
  try {
    if (next) {
      return nextStepByAudit(id);
    } else {
      return handleCancel(id);
    }
  } catch (error) {
    return json(DB_ERROR);
  }
};

// 审核员处理下一步
async function nextStepByAudit(id: number) {
  const orderInfo = await db.order.findUnique({
    where: {
      id,
    },
    select: {
      authorNext: true,
      targetNext: true,
    },
  });
  let updateData;
  const { targetNext, authorNext } = orderInfo || {};
  if (targetNext && authorNext) {
    // 主播与供应商都已经next的话，直接进入下一阶段

    // 清掉同意记录，进入下一阶段
    updateData = {
      authorNext: false,
      targetNext: false,
      status: OrderStatus.DOING,
    };
  } else {
    // 否则仅设置平台next
    updateData= {
      sysNext: true,
    };
  }
  // 更换数据
  await db.order.update({
    where: {
      id,
    },
    data: updateData,
  });
  return json({
    success: true,
  });
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
