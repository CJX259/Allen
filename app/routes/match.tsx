import { LoaderFunction } from 'remix';
import React from 'react';

export const loader: LoaderFunction = async ({ request }) => {
  return null;
};


export default function Match() {
  return <h1>111</h1>;
};
