import {
  Links,
  LiveReload,
  Meta,
  Scripts,
  ScrollRestoration,
  LinksFunction,
  LoaderFunction,
  ActionFunction,
} from 'remix';
import React from 'react';
import type { MetaFunction } from 'remix';
import antdStyle from 'antd/dist/antd.css';
import rootStyles from './styles/css/rootPage.css';
import RootPage from './components/root/index';
import { hadLogin } from './utils/loginUtils';
import { destroySession, getSession } from './sessions';
import { LoginKey } from './const';

export const meta: MetaFunction = () => {
  return { title: 'ALLEN 电商直播配对平台' };
};

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: antdStyle },
    { rel: 'stylesheet', href: rootStyles },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(
      request.headers.get('Cookie'),
  );
  if (!await hadLogin(session)) {
    // 没登录返回null
    return null;
  }
  // 已登录则返回session内容

  const sessionUser = session.get(LoginKey);
  console.log('sessionUser', sessionUser);
  // 不返回null，后续要用null判断有无登录态
  return sessionUser || {};
};
export const action: ActionFunction = async ({ request }) => {
  // 处理登出逻辑
  const session = await getSession(request.headers.get('Cookie'));
  if (!await hadLogin(session)) {
    return null;
  }
  // 已登录则注销session
  return new Response('登出成功', {
    headers: {
      'Set-Cookie': await destroySession(session),
    },
  });
};
/**
 * 根组件
 *
 * @export
 * @return {*}
 */
export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <RootPage />
        {/* <Outlet /> */}
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === 'development' && <LiveReload />}
      </body>
    </html>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return (
    <div style={{
      textAlign: 'center',
    }}>
      <h1>500</h1>
      <h2>服务器出错</h2>
      <h3>{error.message}</h3>
    </div>
  );
};
