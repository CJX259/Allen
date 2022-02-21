import { redirect, json } from 'remix';
import { getSession, commitSession } from '../sessions';
import React from 'react';
import type { LoaderFunction, ActionFunction, LinksFunction } from 'remix';
import { db } from '~/utils/db.server';
import { hadLogin } from '~/utils/loginUtils';
import { LoginKey } from '~/const';
import { NOT_FOUND, PARAMS_ERROR } from '~/error';
import LoginCmp from '../components/login';

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
  const code = form.get('code');
  if (!phone || (!password || !code)) {
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

export default function Login() {
  return <LoginCmp />;
};
