import md5 from 'md5';
import React from 'react';
import { ActionFunction, json, LoaderFunction } from 'remix';
import InfoIndex from '~/components/info/index';
import { LoginKey, updateUserKeys, userUnRequireKeys } from '~/const';
import { DB_ERROR, PARAMS_ERROR } from '~/error';
import { searchUserById } from '~/server/user';
import { getSession } from '~/sessions';
import { db } from '~/utils/db.server';
import { getFromDatas, validateFormDatas } from '~/utils/server.index';


// 处理查询页的搜索请求，返回数据列表
export const loader: LoaderFunction = async ({ request, params }) => {
  const session = await getSession(request.headers.get('Cookie'));
  // const { id, role } = session.get(LoginKey) || {};
  const userId = params.userId;
  if (!userId) {
    return json(PARAMS_ERROR);
  }
  const user = await searchUserById(+userId);
  return { user, loginUser: session.get(LoginKey) || {} };
};
export const action: ActionFunction = async ({ request }) => {
  const rawFormData = await request.formData();
  const requiredKeys = updateUserKeys.filter((key) => userUnRequireKeys.indexOf(key) === -1);
  const formatData = getFromDatas(updateUserKeys, rawFormData);
  // 是否传了必传的参数
  if (!validateFormDatas(requiredKeys, formatData)) {
    return json(PARAMS_ERROR);
  }
  // 如果传了密码，则进行md5加密
  if (formatData.password) {
    formatData.password = md5(formatData.password);
  }
  const id = +formatData.id;
  const newFormatData = {...formatData};
  delete newFormatData.id;
  try {
    // 更新数据
    const updateUser = await db.user.update({
      where: {
        id,
      },
      data: {
        ...newFormatData,
      },
      select: {
        id: true,
      },
    });
    return updateUser;
  } catch (error: any) {
    console.error(error);
    return json(DB_ERROR);
  }
};

export default function UserInfo() {
  return <InfoIndex />;
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
