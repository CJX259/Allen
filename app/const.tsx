import { Role, Status } from '@prisma/client';
import { FormRenderInfo } from './types';
import React from 'react';
import { Input, Tag } from 'antd';
// session中存储用户id和name的key值
export const LoginKey = 'USER';
// session中存储验证码的key值
export const CodeKey = 'VER_CODE';
// session中存储注册信息的key值
export const RegisterKey = 'REGISTER_USER';


// 发送验证码倒计时变量
export const CODE_WAITING = 3;

// form表单的各项长度
export const LoginFormSpan = {
  label: 4,
  input: 20,
};

// 请求方法
export const REQ_METHOD = {
  POST: 'POST',
  GET: 'GET',
  PUT: 'PUT',
  DEL: 'DELETE',
};

// remix提供的加载状态(action与loader)
export const LOAD_STATE = {
  idle: 'idle',
  submitting: 'submitting',
  loading: 'loading',
};

// remix提供的更细致加载状态(action与loader)
export const LOAD_TYPE = {
  init: 'init',
  done: 'done',
  actionSubmission: 'actionSubmission',
  loaderSubmission: 'loaderSubmission',
  actionReload: 'actionReload',
  load: 'load',
};

// 升级所需经验值
export const LEVEL_VAR = 2;

export const USER_PAGESIZE = 1;

export const AUDIT_STATUS_MAP = {
  [Status.ALL]: '全部',
  [Status.PENDING]: '待审核',
  [Status.REJECT]: '已下架',
  [Status.RESOLVE]: '已上架',
};

export const ROLE_MAP = {
  [Role.ADMIN]: '管理员',
  [Role.ANCHOR]: '主播',
  [Role.COMPANY]: '供应商',
};


// 审核查看信息渲染form字段
export const infoRenderInfo: FormRenderInfo[] = [
  {
    name: 'name',
    label: {
      anchor: '昵称',
      company: '公司名称',
    },
    render: (data) => <span className='form-item-name'>
      {data?.name}
      {data?.role && <Tag style={{ marginLeft: 10 }} color={data.role === Role.ANCHOR ? 'green' : 'red'}>{ROLE_MAP[data?.role]}</Tag>}
    </span>,
  },
  {
    name: 'avatarKey',
    label: {
      all: '头像',
    },
    render: (data) => {
      return <img id='avatar' src="" alt="" />;
    },
  },
  {
    name: 'phone',
    label: {
      all: '手机号',
    },
    initialValue: (data) => data?.phone,
    render: () => <Input disabled/>,
  },
  {
    name: 'vx',
    label: {
      all: '微信号',
    },
    initialValue: (data) => data?.vx,
    render: () => <Input disabled />,
  },
  {
    name: 'realName',
    label: {
      anchor: '真实姓名',
      company: '公司法人姓名',
    },
    render: (data) => <span className='form-item-real-name'>{data?.realName}</span>,
  },
  {
    name: 'idCard',
    label: {
      anchor: '身份证号码',
      company: '公司法人身份证号码',
    },
    render: (data) => <span className='form-item-idcard'>{data?.idCard}</span>,
  },
  {
    name: 'mail',
    label: {
      anchor: '邮箱',
      company: '公司邮箱',
    },
    render: (data) => <span className='form-item-mail'>{data?.idCard}</span>,
  },
  {
    name: 'reason',
    label: {
      all: '拒绝原因',
    },
    initialValue: (data) => data?.reason ? data.reason : '',
    render: (data) => data?.status === Status.REJECT ? <Input.TextArea disabled /> : <span>无</span>,
  },
  {
    name: 'address',
    label: {
      anchor: '现居地址',
      company: '公司地址',
    },
    initialValue: (data) => data?.address ? data.address : '',
    render: () => <Input.TextArea disabled />,
  },
  {
    name: 'introduce',
    label: {
      all: '简介',
    },
    initialValue: (data) => data?.introduce ? data.introduce : '',
    render: () => <Input.TextArea disabled />,
  },
];

// 用户所需信息字段
export const userBaseKeys = ['phone', 'name', 'address', 'mail', 'idCard', 'realName', 'introduce', 'password', 'vx', 'avatarKey'];
export const userKeys = [...userBaseKeys, 'role'];
// 非必须的字段
export const userUnRequireKeys = ['introduce', 'password', 'avatarKey'];
// 更新所需字段
export const updateUserKeys = [...userBaseKeys, 'id'];
