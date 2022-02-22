import { redirect, json } from 'remix';
import { getSession, commitSession } from '../sessions';
import React from 'react';
import type { LoaderFunction, ActionFunction, LinksFunction, Session } from 'remix';
import { db } from '~/utils/db.server';
import { hadLogin } from '~/utils/loginUtils';
import { CodeKey, LoginKey, REQ_METHOD } from '~/const';
import { NOT_FOUND, PARAMS_ERROR, TIME_OUT, VERIFY_ERROR } from '~/error';
import LoginCmp from '../components/login';

import loginStyle from '../styles/css/login.css';
import { sendVerCode } from '~/utils/sendMessage';
import { CodeData } from '~/types';


export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: loginStyle }];
};

export const loader: LoaderFunction = async ({ request }) => {
  const cookie = request.headers.get('Cookie');
  if (await hadLogin(cookie)) {
    return redirect('/');
  }
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(
      request.headers.get('Cookie'),
  );
  const form = await request.formData();
  const phone = form.get('phone');
  const method = request.method;
  switch (method) {
    case REQ_METHOD.POST: {
      const password = form.get('password');
      const code = form.get('code');
      if (!phone || (!password && !code)) {
        return json(PARAMS_ERROR);
      }
      // 根据传入的是密码还是验证码，做不同的校验
      if (password) {
        return verifyPsw(session, phone as string, password as string);
      }
      if (code) {
        return verifyCode(session, phone as string, code as string);
      }
      break;
    }
    case REQ_METHOD.PUT: {
      // 判断有无电话数据
      if (!phone) {
        return json(PARAMS_ERROR);
      }
      const curTime = new Date().valueOf();
      // 判断session，如果该电话数据的还未过期，则不允许发送
      const codeData: CodeData = session.get(`${CodeKey}_${phone}`);
      if (curTime - codeData?.sendTime <= 60000) {
        // session里有该手机的数据，且未过60秒
        return json(TIME_OUT);
      }
      // 生成随机数
      const random = `${Math.floor(Math.random() * 1000000)}`;
      console.log('random', random);
      // 设置手机号与随机数到session中，用于post登录时判断（过期时间60秒）
      session.set(`${CodeKey}_${phone}`, {
        phone,
        code: random,
        sendTime: curTime,
      });
      // 调用api发送短信
      // sendVerCode([phone as string], [random]);
      return new Response('发送成功', {
        headers: {
          'Set-Cookie': await commitSession(session),
        },
      });
    }
  }
};

export default function Login() {
  return <LoginCmp />;
};


/**
 * 校验用户输入的账号密码是否正确
 *
 * @param {Session} session
 * @param {string} phone
 * @param {string} password
 * @return {*} redirect
 */
async function verifyPsw(session: Session, phone: string, password: string) {
  const user = await db.user.findFirst({
    where: {
      phone: phone as string,
      password: password as string,
    },
    select: {
      id: true,
      name: true,
    },
  });
  if (user == null) {
    return json(NOT_FOUND);
  }
  session.set(LoginKey, {
    id: user.id,
    name: user.name,
  });
  // Login succeeded, send them to the home page.
  return redirect('/', {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
};

async function verifyCode(session: Session, phone: string, code: string) {
  // 拿session中的phone数据，与code参数比较，若一致，则通过
  const codeData: CodeData = await session.get(`${CodeKey}_${phone}`);
  console.log('codeData', codeData);
  if (!codeData) {
    return json(PARAMS_ERROR);
  }
  if (codeData.code !== code) {
    return json(VERIFY_ERROR);
  }
  return json({
    msg: '登录成功',
  });
  // 通过后，若数据库中有该账号，则直接登录
  // 若没有，则直接注册
  // 跳转首页
};
