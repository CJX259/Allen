import React from 'react';
import { ActionFunction, LoaderFunction, LinksFunction, json } from 'remix';
import { redirect } from 'remix';
import md5 from 'md5';
import { LoginKey, RegisterKey } from '~/const';
import { DB_ERROR, PARAMS_ERROR } from '~/error';
import { commitSession, getSession } from '~/sessions';
import { SessionRegisterData, SessionUserData } from '~/types';
import { getFromDatas, validateFormDatas } from '~/utils/server.index';
import { db } from '~/utils/db.server';

import RegisterCmp from '../components/register';
import registerCss from '../styles/css/register.css';

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
  return data ? data.phone : redirect('/login');
};

export const action: ActionFunction = async ({ request, params }) => {
  const rawFormData = await request.formData();
  const keys = ['phone', 'name', 'address', 'mail', 'role', 'idCard', 'realName', 'introduce', 'password', 'vx', 'avatarKey'];
  const unRequireKeys = ['introduce', 'password', 'avatarKey'];
  const requiredKeys = keys.filter((key) => unRequireKeys.indexOf(key) === -1);
  const formatData = getFromDatas(keys, rawFormData);
  // 是否传了必传的参数
  if (!validateFormDatas(requiredKeys, formatData)) {
    return json(PARAMS_ERROR);
  }
  // 如果传了密码，则进行md5加密
  if (formatData.password) {
    formatData.password = md5(formatData.password);
  }
  try {
    // 插入新数据
    const newUser = await db.user.create({
      data: {...formatData},
    });
    console.log('newUser', newUser);
    // 设置login session
    const session = await getSession(
        request.headers.get('Cookie'),
    );
    session.set(LoginKey, {
      id: newUser.id,
      role: newUser.role,
    } as SessionUserData);
    return redirect('/home', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  } catch (error: any) {
    console.error(error);
    return json(DB_ERROR);
  }
};

export default function Register() {
  return <RegisterCmp />;
};

