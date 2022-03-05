import React from 'react';
import { ActionFunction, LoaderFunction } from 'remix';
import AuditUserComp from '~/components/auditUser';

export const loader: LoaderFunction = ({ request }) => {
  return null;
};

export const action: ActionFunction = ({ request }) => {
  return null;
};

export default function AuditUser() {
  return <AuditUserComp />;
};
