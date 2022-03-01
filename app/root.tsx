import {
  Links,
  LiveReload,
  Meta,
  Scripts,
  ScrollRestoration,
  LinksFunction,
  LoaderFunction,
} from 'remix';
import React from 'react';
import type { MetaFunction } from 'remix';
import antdStyle from 'antd/dist/antd.css';
import rootStyles from './styles/css/rootPage.css';
import RootPage from './components/root/index';
import { getSession } from './sessions';
import { LoginKey } from './const';
import { SessionUserData } from './types';
import { RootLoaderData } from './types/loaderData';

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
  const pathname = new URL(request.url).pathname;
  const session = await getSession(
      request.headers.get('Cookie'),
  );
  const sessionUser = session.get(LoginKey) as SessionUserData;
  // 页面通过user是否为null，判断用户是否登录
  const res: RootLoaderData = {
    user: sessionUser,
    pathname,
  };
  return res;
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
