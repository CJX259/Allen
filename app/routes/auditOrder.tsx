import { Role, Status } from '@prisma/client';
import React from 'react';
import { LinksFunction, LoaderFunction } from 'remix';
import AuditOrderComp from '~/components/auditOrder';
import { USER_PAGESIZE } from '~/const';
import { searchUser } from '~/server/user';
import { AuditUserLoaderData } from '~/types';
import { needLogined } from '~/utils/loginUtils';
import { transformNullAndUndefined } from '~/utils/server.index';
import style from '~/styles/css/auditOrder.css';

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
  let status = searchParams.get('status') as Status;
  status = transformNullAndUndefined(status);
  const page = +(searchParams.get('page') || 1);
  const pageSize = +(searchParams.get('pageSize') || USER_PAGESIZE);
  const res: AuditUserLoaderData = {
    searchKey,
    data: null,
    status,
    total: 0,
    page,
  };
  // 默认搜索所有状态的
  const { data, total } = await searchUser(searchKey || '', page, pageSize, status as Status || Status.ALL);
  res.data = data;
  res.total = total;
  return res;
};

export default function AuditOrder() {
  return <AuditOrderComp />;
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
