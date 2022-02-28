import {
  LoaderFunction, Outlet,
} from 'remix';
import React from 'react';

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

