import { Status } from '@prisma/client';
import React from 'react';
import { ActionFunction, LinksFunction, LoaderFunction } from 'remix';
import AuditUserComp from '~/components/auditUser';
import { USER_PAGESIZE } from '~/const';
import { searchUser } from '~/server/user';
import { AuditUserLoaderData } from '~/types';
import style from '~/styles/css/auditUser.css';
import { needLogined } from '~/utils/loginUtils';

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: style }];
};

export const loader: LoaderFunction = async ({ request }) => {
  const redirectRes = await needLogined(request);
  console.log('red', redirectRes);
  if (redirectRes) {
    return redirectRes;
  }
  // 按搜索条件，分页查询用户
  const searchParams = new URL(request.url).searchParams;
  let searchKey = searchParams.get('searchKey');
  // 避免转化时转为字符undefined or null
  if (searchKey === 'undefined' || searchKey === 'null') {
    searchKey = '';
  }
  const status = searchParams.get('status') as Status;
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
  const { data, total } = await searchUser(searchKey, page, pageSize, status as Status || Status.ALL);
  res.data = data;
  res.total = total;
  return res;
};

export const action: ActionFunction = ({ request }) => {
  return null;
};

export default function AuditUser() {
  return <AuditUserComp />;
};
