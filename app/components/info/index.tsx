import { Role } from '@prisma/client';
import { Button, Form, Input } from 'antd';
import React, { useState } from 'react';
import { useLoaderData, useTransition } from 'remix';
import { LOAD_STATE } from '~/const';
import { FormRenderInfo, UserJoinTag } from '~/types';
import { validateRepeat } from '~/utils/client.index';
import BaseFormItem from '../register/BaseFormItem';
import { FORM_COL, RULE_REQUIRED } from '../register/const';
import UploadAvatar from '../register/UploadAvatar';

export default function InfoIndex() {
  const loaderData: UserJoinTag = useLoaderData();
  const [fileObj, setFileObj] = useState(null as any);
  const [form] = Form.useForm();
  const transition = useTransition();
  function onFinish() {
    return null;
  }
  // 审核查看信息渲染form字段
  const infoRenderInfo: FormRenderInfo[] = [
    {
      name: 'avatarKey',
      label: {
        all: '头像',
      },
      render: (data) => {
        return <UploadAvatar setFileObj={setFileObj} />;
      },
    },
    {
      name: 'name',
      label: {
        anchor: '昵称',
        company: '公司名称',
      },
      rules: [
        RULE_REQUIRED,
        {
          max: 12,
          message: '长度不能超过12',
        },
        {
          validator: async (rule, value) => {
            return validateRepeat('name', value, '昵称已存在');
          },
        },
      ],
      initialValue: (data) => data?.name,
      render: () => (
        <Input placeholder='请填写昵称(小于12个字符)' />
      ),
    },
    {
      name: 'phone',
      label: {
        all: '手机号',
      },
      rules: [RULE_REQUIRED],
      initialValue: (data) => data?.phone,
      render: () => <Input/>,
    },
    {
      name: 'vx',
      label: {
        all: '微信号',
      },
      rules: [RULE_REQUIRED],
      initialValue: (data) => data?.vx,
      render: () => <Input />,
    },
    {
      name: 'realName',
      label: {
        anchor: '真实姓名',
        company: '公司法人姓名',
      },
      initialValue: (data) => data?.realName,
      render: (data) => <Input placeholder='请填写真实姓名' />,
    },
    {
      name: 'idCard',
      label: {
        anchor: '身份证号码',
        company: '公司法人身份证号码',
      },
      rules: [
        RULE_REQUIRED,
        {
          validator: async (rule, value) => {
            return validateRepeat('idCard', value, '身份证号已存在');
          },
        },
      ],
      initialValue: (data) => data?.idCard,
      render: (data) => <Input placeholder='请填写身份证号码' />,
    },
    {
      name: 'mail',
      label: {
        anchor: '邮箱',
        company: '公司邮箱',
      },
      initialValue: (data) => data?.mail,
      render: (data) => <Input placeholder='请填写邮箱地址' />,
      rules: [
        RULE_REQUIRED,
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
      rules: [
        RULE_REQUIRED,
        // {
        //   validator: async (rule, value) => {
        //     if (!value) {
        //       return Promise.resolve();
        //     }
        //     const addressReg = /([^省]+省|.+自治区|[^市]+市)([^自治州]+自治州|[^市]+市|[^盟]+盟|[^地区]+地区|.+区划)([^市]+市|[^县]+县|[^旗]+旗|.+区)/;
        //     return addressReg.test(value) ? Promise.resolve() : Promise.reject(new Error('地址格式有误'));
        //   },
        // },
      ],
      initialValue: (data) => data?.address ? data.address : '',
      render: () => <Input.TextArea placeholder='请填写地址（精确到街道）' />,
    },
    {
      name: 'password',
      label: {
        all: '登录密码',
      },
      render: () => <Input.Password placeholder='(选填，不填仅能用验证码登录)'/>,
    },
    {
      name: 'introduce',
      label: {
        all: '简介',
      },
      initialValue: (data) => data?.introduce ? data.introduce : '',
      render: () => <Input.TextArea placeholder='介绍一下自己，可以让别人更快了解你'/>,
    },
  ];
  return (
    <div className="info-wrapper">
      <Form
        form={form}
        onFinish={onFinish}
        className='form-content'
        labelCol={{ span: FORM_COL.label }}
        wrapperCol={{ span: FORM_COL.wrapper }}
      >
        <BaseFormItem data={loaderData} infos={infoRenderInfo} isAnchor={loaderData.role === Role.ANCHOR} />
        <Form.Item wrapperCol={{ offset: FORM_COL.label, span: FORM_COL.wrapper }}>
          <Button loading={transition.state === LOAD_STATE.submitting} type='primary' htmlType='submit'>提交</Button>
        </Form.Item>
      </Form>
    </div>
  );
}
