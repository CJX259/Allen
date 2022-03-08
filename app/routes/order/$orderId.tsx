import { json, LoaderFunction } from 'remix';
import React from 'react';
import { PARAMS_ERROR } from '~/error';

export const loader: LoaderFunction = async ({ request, params }) => {
  const { orderId } = params;
  if (!orderId) {
    return json(PARAMS_ERROR);
  }
  return null;
};

// 类似步骤条的ui
export default function Detail() {
  return <h1>orderdetail</h1>;
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
