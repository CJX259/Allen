import { LoaderFunction } from 'remix';
import React from 'react';

export const loader: LoaderFunction = () => {
  return null;
};

export default function Pusher() {
  return (
    <iframe className='live-page' src="../livePusher.html"></iframe>
  );
};
