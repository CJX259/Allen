import { LoaderFunction } from 'remix';
import React from 'react';
// import TLSSigAPIv2 from 'tls-sig-api-v2';
// const TLSSigAPIv2 = require('tls-sig-api-v2');

export const loader: LoaderFunction = () => {
  // const api = new TLSSigAPIv2.Api(1400509104, 'f200c81949c32392f6e43ebccf3d7f41a919fa9bb287375cc8909591745be5f7');
  // const sig = api.genSig('jessy', 86400*18000);
  // console.log(sig);
  // return { userSig: sig };
  return null;
};

export default function Player() {
  return (
    <iframe className='live-page' src="../livePlayer.html"></iframe>
  );
};
