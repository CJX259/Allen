import { json } from 'remix';
import { getSession } from '../sessions';
import React from 'react';
import type { LoaderFunction, ActionFunction, LinksFunction } from 'remix';
import { handleCodeSend, handleLogout, needLogined, validatePhone, verifyCode, verifyPsw } from '~/utils/loginUtils';
import { REQ_METHOD } from '~/const';
import { PARAMS_ERROR } from '~/error';
import LoginCmp from '../components/login';

import loginStyle from '../styles/css/login.css';

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
      validatePhone(phone as string);
      const password = form.get('password');
      const code = form.get('code');
      if (!password && !code) {
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
      validatePhone(phone as string);
      return handleCodeSend(session, phone as string);
    }
    case REQ_METHOD.DEL: {
      return handleLogout(session);
    }
  }
};

export default function Login() {
  return <LoginCmp />;
};
