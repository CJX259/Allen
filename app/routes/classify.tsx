import React from 'react';
import { LinksFunction, Outlet } from 'remix';

import searchStyle from '~/styles/css/search.css';

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: searchStyle }];
};


export default function ClassifyPage() {
  return (
    <Outlet />
  );
};
