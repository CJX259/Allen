import React from 'react';
import { Outlet } from 'remix';

// import classifyStyle from '~/styles/css/classify.css';

// export const links: LinksFunction = () => {
//   return [{ rel: 'stylesheet', href: classifyStyle }];
// };


export default function InfoIndex() {
  return (
    <Outlet />
  );
};


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
