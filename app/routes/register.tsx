import React from 'react';
import { ActionFunction, LoaderFunction, LinksFunction, json } from 'remix';
import { redirect } from 'remix';
import { LoginKey, RegisterKey } from '~/const';
import { DB_ERROR, DB_ROW_REPEAT, PARAMS_ERROR } from '~/error';
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
  const keys = ['phone', 'name', 'address', 'mail', 'role', 'idCard', 'realName', 'introduce'];
  const requiredKeys = keys.filter((key) => key !== 'introduce');
  const formatData = getFromDatas(keys, rawFormData);
  if (!validateFormDatas(requiredKeys, formatData)) {
    return json(PARAMS_ERROR);
  }
  try {
    // 尝试输入的时候就进行校验提示
    // // 插入数据库前先看下有无重复的数据
    // const proms: Promise<any>[] = [];
    // const uniqueKeys = ['name', 'phone', 'idCard'];
    // uniqueKeys.forEach((key: string) => {
    //   proms.push(db.user.findUnique({
    //     where: {
    //       [key]: formatData[key],
    //     },
    //     select: {
    //       id: true,
    //     },
    //   }));
    // });
    // const resUser = await Promise.all(proms);
    // if (resUser.length) {
    //   return json(DB_ROW_REPEAT);
    // }
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
      name: newUser.name,
    } as SessionUserData);
    return redirect('/', {
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
