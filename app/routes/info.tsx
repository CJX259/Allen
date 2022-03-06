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
