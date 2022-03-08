import { Role } from '@prisma/client';
import { Tag } from 'antd';
import React from 'react';
import { ROLE_MAP } from '~/const';

export default function RoleTag(props: {role: Role | undefined}) {
  const { role } = props;
  if (!role) {
    return null;
  }
  // admin为orange
  let color = 'orange';
  if (role === Role.ANCHOR) {
    color = 'green';
  }
  if (role === Role.COMPANY) {
    color = 'red';
  };
  return <Tag style={{ marginLeft: 10 }} color={color}>{ROLE_MAP[role]}</Tag>;
};
