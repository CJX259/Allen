import React from 'react';
import { LinksFunction, Outlet } from 'remix';
import Chat from '~/components/live/Chat';

import style from '../styles/css/liveWrapper.css';

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: style }];
};

/**
 * 直播间页面，内嵌静态html，通过cookie传递加密后的url数据
 *
 * @export
 * @return {*}
 */
export default function livePage() {
  return (
    <div className='live-wrapper'>
      <Outlet />
      <Chat />
    </div>
  );
}


export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return (
    <div>
      <h1>500</h1>
      <h2>服务器出错</h2>
      <h3>{error.message}</h3>
    </div>
  );
};
