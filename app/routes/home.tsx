import {
  LinksFunction,
  LoaderFunction, Outlet,
} from 'remix';
import React from 'react';
import homeStyle from '~/styles/css/home.css';

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: homeStyle }];
};

export const loader: LoaderFunction = async ({ request }) => {
  return null;
};

export default function IndexPage() {
  return <Outlet/>;
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
