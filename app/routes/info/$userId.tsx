import md5 from 'md5';
import React from 'react';
import { ActionFunction, json, LoaderFunction } from 'remix';
import InfoIndex from '~/components/info/index';
import { updateUserKeys, userUnRequireKeys } from '~/const';
import { DB_ERROR, PARAMS_ERROR } from '~/error';
import { searchUserById } from '~/server/user';
import { db } from '~/utils/db.server';
import { getFromDatas, validateFormDatas } from '~/utils/server.index';


// 处理查询页的搜索请求，返回数据列表
export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = params.userId;
  if (!userId) {
    return json(PARAMS_ERROR);
  }

  const user = await searchUserById(+userId);
  return user;
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
