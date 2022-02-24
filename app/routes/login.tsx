import { redirect, json } from 'remix';
import { getSession, commitSession } from '../sessions';
import React from 'react';
import type { LoaderFunction, ActionFunction, LinksFunction, Session } from 'remix';
import { db } from '~/utils/db.server';
import { hadLogin, needLogined } from '~/utils/loginUtils';
import { CodeKey, LoginKey, RegisterKey, REQ_METHOD } from '~/const';
import { NOT_FOUND, PARAMS_ERROR, TIME_OUT, VERIFY_ERROR } from '~/error';
import LoginCmp from '../components/login';

import loginStyle from '../styles/css/login.css';
import { sendVerCode } from '~/utils/sendMessage';
import { SessionCodeData, SessionRegisterData, SessionUserData } from '~/types';


export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: loginStyle }];
};

export const loader: LoaderFunction = async ({ request }) => {
  return needLogined(request);
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
      return handleCodeSend(session, phone as string);
    }
  }
};

export default function Login() {
  return <LoginCmp />;
};


/**
 * action处理发送验证码逻辑
 *
 * @param {Session} session
 * @param {string} phone
 * @return {*} Response
 */
async function handleCodeSend(session: Session, phone: string) {
  // 判断有无电话数据
  if (!phone) {
    return json(PARAMS_ERROR);
  }
  const curTime = new Date().valueOf();
  // 判断session，如果该电话数据的还未过期，则不允许发送
  const codeData: SessionCodeData = session.get(`${CodeKey}_${phone}`);
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
  // 调用api发送短信，先注释掉，短信有次数
  // sendVerCode([phone as string], [random]);
  return new Response('发送成功', {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
}

/**
 * 校验用户输入的账号密码是否正确
 *
 * @param {Session} session
 * @param {string} phone
 * @param {string} password
 * @return {*} Response
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
  session.set(LoginKey, user as SessionUserData);
  // Login succeeded, send them to the home page.
  return redirect('/', {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
};


/**
 * 校验验证码，处理跳转页面逻辑
 *
 * @param {Session} session
 * @param {string} phone
 * @param {string} code
 * @return {*} redirect
 */
async function verifyCode(session: Session, phone: string, code: string) {
  // 拿session中的phone数据，与code参数比较，若一致，则通过
  const codeData: SessionCodeData = await session.get(`${CodeKey}_${phone}`);
  if (!codeData) {
    return json(PARAMS_ERROR);
  }
  if (codeData.code !== code) {
    return json(VERIFY_ERROR);
  }
  // 通过后，若数据库中有该账号，则直接登录
  const user = await db.user.findFirst({
    where: {
      phone,
    },
    select: {
      id: true,
      name: true,
    },
  });
  // 清除session
  session.set(`${CodeKey}_${phone}`, null);
  let to = '/';
  if (!user) {
    // 没创建，进入注册页，设置session
    to = '/register';
    session.set(RegisterKey, {
      phone,
    } as SessionRegisterData);
  } else {
    // 如果已有账号，则设置cookie
    session.set(LoginKey, user as SessionUserData);
  }
  return redirect(to, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
};
