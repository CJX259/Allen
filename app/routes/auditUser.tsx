import { Role, Status } from '@prisma/client';
import React from 'react';
import { ActionFunction, json, LinksFunction, LoaderFunction } from 'remix';
import AuditUserComp from '~/components/auditUser';
import { USER_PAGESIZE } from '~/const';
import { searchUser, updateUser } from '~/server/user';
import { AuditUserLoaderData } from '~/types';
import style from '~/styles/css/auditUser.css';
import { needLogined } from '~/utils/loginUtils';
import { transformNullAndUndefined } from '~/utils/server.index';
import { PARAMS_ERROR } from '~/error';

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
  const { data, total } = await searchUser(searchKey, page, pageSize, status as Status || Status.ALL);
  res.data = data;
  res.total = total;
  return res;
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const userId = formData.get('id');
  const status = formData.get('status');
  let reason = formData.get('reason');
  if (!userId || !status) {
    return json(PARAMS_ERROR);
  }
  // 更新用户
  const params = { status: status } as any;
  reason = transformNullAndUndefined(reason);
  reason ? params.reason = reason : '';
  const res = await updateUser(+userId, params);
  console.log(res);
  return null;
};

export default function AuditUser() {
  return <AuditUserComp />;
};
