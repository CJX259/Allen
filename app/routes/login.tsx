import { Form, redirect, json, useActionData, useTransition } from 'remix';
import React, { useEffect, useState } from 'react';
import { Button, Input, message, Row, Col } from 'antd';
import { getSession, commitSession } from '../sessions';
import type { LoaderFunction, ActionFunction, LinksFunction } from 'remix';
import { db } from '~/utils/db.server';
import { hadLogin } from '~/utils/loginUtils';
import { LoginKey } from '~/const';
import { ERROR } from '../types';
import { NOT_FOUND, PARAMS_ERROR } from '~/error';
import { LOGIN_METHOD } from '../types';
import loginStyle from '../styles/css/login.css';


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
  const password = form.get('password');
  if (!phone || !password) {
    return json(PARAMS_ERROR);
  }
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

/**
 * 登录页表单
 *
 * @export
 * @return {*}
 */
export default function Login() {
  const errorData: ERROR | undefined = useActionData();
  const transition = useTransition();
  const [loginMethod, setLoginMethod] = useState(LOGIN_METHOD.CODE);

  function renderCodeOrPassword() {
    if (loginMethod === LOGIN_METHOD.CODE) {
      return <>
        验证码：<Input name='code' />
        <Button>发送验证码</Button>
      </>;
    }
    return <>
      密码：<Input type="password" name='password' />
    </>;
  };

  useEffect(() => {
    errorData?.msg ? message.error(errorData.msg) : '';
  }, [errorData]);

  return (
    <div className='login-wrapper'>
      <Form method='post'>
        <Row>
          <Col span={4}><label htmlFor="phone">账号：</label></Col>
          <Col span={12}><Input name='phone'/></Col>
        </Row>
        {renderCodeOrPassword()}
        <Button type="link" onClick={() => changeLoginMethod(loginMethod, setLoginMethod)}>
          {loginMethod === LOGIN_METHOD.CODE ? '密码登录' : '验证码登录'}
        </Button>
        <Button
          htmlType='submit'
          loading={transition.state === 'submitting'}
        >jessy按钮</Button>
      </Form>
    </div>
  );
}

function changeLoginMethod(loginMethod: LOGIN_METHOD, setLoginMethod: Function) {
  setLoginMethod(loginMethod === LOGIN_METHOD.CODE ?
    LOGIN_METHOD.PASSWORD :
    LOGIN_METHOD.CODE);
};
