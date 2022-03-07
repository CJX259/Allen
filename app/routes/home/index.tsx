import {
  LoaderFunction,
  ActionFunction,
} from 'remix';
import React from 'react';
import HomeComp from '../../components/home';

export const loader: LoaderFunction = async ({ request }) => {
  return null;
};
export const action: ActionFunction = async ({ request }) => {
  return null;
};

export default function HomePageCmp() {
  return (
    <HomeComp />
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
