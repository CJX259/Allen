import React from 'react';
import { ActionFunction } from 'remix';
import SearchComp from '~/components/search';

export const action: ActionFunction = ({ request, params }) => {
  const role = params.role;
  
  return 'aciton!~~`';
};

export default function SearchType() {
  return <SearchComp />;
};
