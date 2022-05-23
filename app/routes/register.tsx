import React from 'react';
import { ActionFunction, LoaderFunction, LinksFunction, json } from 'remix';
import { redirect } from 'remix';
import md5 from 'md5';
import { DEFAULT_AVATAR_KEY, LoginKey, RegisterKey, userKeys, userUnRequireKeys } from '~/const';
import { DB_ERROR, PARAMS_ERROR } from '~/error';
import { commitSession, getSession } from '~/sessions';
import { SessionRegisterData, SessionUserData } from '~/types';
import { getFromDatas, validateFormDatas } from '~/utils/server.index';
import { db } from '~/utils/db.server';

import RegisterCmp from '../components/register';
import registerCss from '../styles/css/register.css';
import { getAllTags, userConnectTag } from '~/server/tag';

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: registerCss },
  ];
};

export const loader: LoaderFunction = async ({ request, params }) => {
  // 拿cookie里存到的phone
  const session = await getSession(
      request.headers.get('Cookie'),
  );
  const data = session.get(RegisterKey) as SessionRegisterData;
  const allTags = await getAllTags();
  return data ? { phone: data.phone, allTags } : redirect('/login');
};

export const action: ActionFunction = async ({ request, params }) => {
  const rawFormData = await request.formData();
  const requiredKeys = userKeys.filter((key) => userUnRequireKeys.indexOf(key) === -1);
  const formDatas = getFromDatas(userKeys, rawFormData);
  // 是否传了必传的参数
  if (!validateFormDatas(requiredKeys, formDatas)) {
    return json(PARAMS_ERROR);
  }
  // 解析tags
  const tags = formDatas.tags?.split(',')?.map((item: string) => +item) || [];
  delete formDatas.tags;
  console.log('formDatas', formDatas);
  const newFormData = formatFormData(formDatas);
  console.log('newFormData', newFormData);
  try {
    // 插入新数据
    const newUser = await db.user.create({
      data: {...newFormData},
    });
    // 给该user设置tags
    await userConnectTag(newUser.id, tags);
    console.log('newUser', newUser);
    // 设置login session
    const session = await getSession(
        request.headers.get('Cookie'),
    );
    session.set(LoginKey, {
      id: newUser.id,
      role: newUser.role,
    } as SessionUserData);
    const handleSession = await commitSession(session);
    return redirect('/home', {
      headers: {
        'Set-Cookie': handleSession,
      },
    });
  } catch (error: any) {
    console.error(error);
    return json(DB_ERROR);
  }
};

/**
 * 对特殊字段进行处理
 *
 * @param {*} formDatas
 * @return {*}
 */
function formatFormData(formDatas: any) {
  const newFormData = {...formDatas} as any;
  // 注册时没传头像的，设置默认头像
  if (!formDatas.avatarKey) {
    newFormData.avatarKey = DEFAULT_AVATAR_KEY;
  }
  // 如果传了密码，则进行md5加密
  if (formDatas.password) {
    newFormData.password = md5(formDatas.password);
  }
  return newFormData;
}

export default function Register() {
  return <RegisterCmp />;
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
