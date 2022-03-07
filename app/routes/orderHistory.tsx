import { LoaderFunction } from 'remix';
import React from 'react';

export const loader: LoaderFunction = async ({ request }) => {
  return null;
};


export default function Match() {
  return <h1>orderHistory</h1>;
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
