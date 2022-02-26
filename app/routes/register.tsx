import React from 'react';
import { ActionFunction, LoaderFunction, LinksFunction, json } from 'remix';
import { redirect } from 'remix';
import { RegisterKey } from '~/const';
import { DB_ERROR, PARAMS_ERROR } from '~/error';
import { getSession } from '~/sessions';
import { SessionRegisterData } from '~/types';
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
  const keys = ['phone', 'name', 'address', 'mail', 'role', 'idCard', 'realName', 'introduce'];
  const requiredKeys = keys.filter((key) => key !== 'introduce');
  const formatData = getFromDatas(keys, rawFormData);
  if (!validateFormDatas(requiredKeys, formatData)) {
    return json(PARAMS_ERROR);
  }
  console.log('formatData', formatData);
  // 插入数据库
  try {
    const newUser = await db.user.create({
      data: {...formatData},
    });
    console.log('newUser', newUser);
    return redirect('/');
  } catch (error: any) {
    console.error(error);
    DB_ERROR.msg = error.message;
    return json(DB_ERROR);
  }
  return null;
};

export default function Register() {
  return <RegisterCmp />;
};
