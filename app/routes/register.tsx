import React from 'react';
import type { ActionFunction, LoaderFunction, LinksFunction } from 'remix';
import { redirect } from 'remix';
import { RegisterKey } from '~/const';
import { getSession } from '~/sessions';
import { SessionRegisterData } from '~/types';

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
  return null;
};

export default function Register() {
  return <RegisterCmp />;
};
