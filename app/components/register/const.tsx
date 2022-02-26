import { Input } from 'antd';
import React from 'react';
import { FormRenderInfo } from '~/types';

// 表单的布局变量
export const FORM_COL = {
  label: 6,
  wrapper: 10,
};

// 用于循环渲染简单的表单项
export const UserRenderInfos: FormRenderInfo[] = ([
  {
    name: 'name',
    required: true,
    label: {
      anchor: '昵称',
      company: '公司名称',
    },
    render: () => <Input placeholder='请填写昵称(小于12个字符)' />,
    rules: [
      {
        max: 12,
        message: '长度不能超过12',
      },
    ],
  },
  {
    name: 'realName',
    label: {
      anchor: '真实姓名',
      company: '公司法人姓名',
    },
    required: true,
    render: () => <Input placeholder='请填写真实姓名' />,
  },
  {
    name: 'idCard',
    label: {
      anchor: '身份证号码',
      company: '公司法人身份证号码',
    },
    required: true,
    render: () => <Input placeholder='请填写身份证号码' />,
    // rules: [
    //   {
    //     validator: async (_, value) => {
    //       value ? Promise.resolve() : Promise.reject(new Error('Should accept agreement'));
    //     },
    //   },
    // ],
  },
  {
    name: 'mail',
    label: {
      anchor: '邮箱',
      company: '公司邮箱',
    },
    required: true,
    render: () => <Input placeholder='请填写邮箱地址'/>,
    rules: [
      {
        type: 'email',
        message: '邮箱格式不正确',
      },
    ],
  },
  {
    name: 'address',
    label: {
      anchor: '现居地址',
      company: '公司地址',
    },
    required: true,
    render: () => <Input.TextArea placeholder='请填写地址'/>,
  },
  {
    name: 'introduce',
    label: {
      all: '简介',
    },
    required: false,
    render: () => <Input.TextArea placeholder='介绍一下自己，可以让别人更快了解你'/>,
  },
] as FormRenderInfo[]).map((ele: FormRenderInfo) => {
  // 如果有required，则在rules中都加入必填规则
  if (ele.required) {
    const rule = {
      required: true,
      message: '此项必须填写',
    };
    ele.rules ?
    ele.rules.push(rule) :
    ele.rules = [rule];
  }
  return ele;
});
