import {
  LoaderFunction,
  ActionFunction,
} from 'remix';
import React from 'react';

export const loader: LoaderFunction = async ({ request }) => {
  return null;
};
export const action: ActionFunction = async ({ request }) => {
  return null;
};

export default function IndexPageCmp() {
  return (
    <>
      <h1>欢迎访问Allen电商配对平台</h1>
      <h4>如果你是带货主播，在这里你可以找到最适合你的商品</h4>
      <h4>如果你是供应商，在这里你可以找到最能推广你们商品的主播</h4>
    </>
  );
}

