import React from 'react';
import type { LoaderFunction, ActionFunction, LinksFunction } from 'remix';

import searchStyle from '~/styles/css/search.css';

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: searchStyle }];
};

export const loader: LoaderFunction = async ({ request }) => {
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  return null;
};

export default function SearchPage() {
  return <div className='search-wrapper'>
    <h1>searchs</h1>
  </div>;
};
