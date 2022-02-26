import { Input } from 'antd';
import React from 'react';
import { FormRenderInfo } from '~/types';

export const userRenderInfos: FormRenderInfo[] = [
  {
    name: 'name',
    required: true,
    label: {
      anchor: '昵称',
      company: '公司名称',
    },
    render() {
      return <Input />;
    },
  },
  {
    name: 'realName',
    label: {
      anchor: '真实姓名',
      company: '公司法人姓名',
    },
    required: true,
    render() {
      return <Input />;
    },
  },
  {
    name: 'idCard',
    label: {
      anchor: '身份证号码',
      company: '公司法人身份证号码',
    },
    required: true,
    render() {
      return <Input />;
    },
  },
  {
    name: 'address',
    label: {
      anchor: '现居地址',
      company: '公司地址',
    },
    required: true,
    render() {
      return <Input />;
    },
  },
  {
    name: 'mail',
    label: {
      anchor: '邮箱',
      company: '公司邮箱',
    },
    required: true,
    render() {
      return <Input />;
    },
  },
];
