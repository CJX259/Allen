import { Form, redirect, json, useActionData } from 'remix';
import React, { useEffect } from 'react';
import { Button, Input, message } from 'antd';
import { getSession, commitSession } from '../sessions';
import type { LoaderFunction, ActionFunction } from 'remix';
import { db } from '~/utils/db.server';
import { hadLogin } from '~/utils/loginUtils';
import { LoginKey } from '~/const';
import { ERROR } from '../types';
import { NOT_FOUND, PARAMS_ERROR } from '~/error';

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
  useEffect(() => {
    errorData?.msg ? message.error(errorData.msg) : '';
  }, [errorData]);
  return (
    <>
      <Form method='post'>
        账号：<Input name='phone' />
        密码：<Input name='password' />
        <Button htmlType='submit'>jessy按钮</Button>
      </Form>
    </>
  );
}
