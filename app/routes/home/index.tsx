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

