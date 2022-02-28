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
  return (
    <>
      <Outlet/>
    </>
  );
}

