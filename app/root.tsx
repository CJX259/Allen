import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  LinksFunction,
} from 'remix';
import React from 'react';
import type { MetaFunction } from 'remix';
import antdStyle from 'antd/dist/antd.css';

export const meta: MetaFunction = () => {
  return { title: 'ALLEN 电商直播配对平台' };
};

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: antdStyle }];
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
        <Outlet />
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
