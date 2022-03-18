import React, { useEffect, useState } from 'react';
import { useLoaderData, useActionData, useSubmit, useTransition } from 'remix';
import { Form, Input, Button, Radio, message, Select } from 'antd';
import type { FormInstance } from 'antd';
import type { SubmitFunction } from 'remix';
import BaseFormItem from './BaseFormItem';
import { FORM_COL, RULE_REQUIRED } from './const';
import UploadImg from '../UploadImg';
import { Role, Tag } from '@prisma/client';
import { FormRenderInfo } from '~/types';
import { formatFormData, formatTags, validateRepeat } from '~/utils/client.index';
import { LOAD_STATE } from '~/const';

const { Option } = Select;

export default function RegisterCmp() {
  const { phone, allTags } = useLoaderData() || {};
  const errorData = useActionData();
  const [form] = Form.useForm();
  const submit = useSubmit();
  const transition = useTransition();
  // 是否为主播，用于表单label判断
  const [isAnchor, setIsAnchor] = useState(true);
  useEffect(() => {
    errorData?.msg ? message.error(errorData.msg) : '';
  }, [errorData]);
  const UserRenderInfos: FormRenderInfo[] = [
    {
      name: 'avatarKey',
      label: {
        all: '头像',
      },
      render: () => <UploadImg />,
    },
    {
      name: 'phone',
      label: {
        all: '手机号',
      },
      initialValue: () => phone,
      rules: [RULE_REQUIRED],
      render: () => <Input disabled/>,
    },
    {
      name: 'vx',
      label: {
        all: '微信号',
      },
      initialValue: () => phone,
      rules: [RULE_REQUIRED],
      render: () => <Input />,
    },
    {
      name: 'role',
      label: {
        all: '您的身份是：',
      },
      rules: [RULE_REQUIRED],
      initialValue: () => Role.ANCHOR,
      render: () => {
        return (
          <Radio.Group onChange={() => changeRole(form, setIsAnchor)}>
            <Radio value={Role.ANCHOR}>主播</Radio>
            <Radio value={Role.COMPANY}>供应商</Radio>
          </Radio.Group>
        );
      },
    },
    {
      name: 'name',
      label: {
        anchor: '昵称',
        company: '公司名称',
      },
      render: () => <Input placeholder='请填写昵称(小于12个字符)' />,
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
    },
    {
      name: 'realName',
      label: {
        anchor: '真实姓名',
        company: '公司法人姓名',
      },
      rules: [RULE_REQUIRED],
      render: () => <Input placeholder='请填写真实姓名' />,
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
      render: () => <Input placeholder='请填写身份证号码' />,
    },
    {
      name: 'mail',
      label: {
        anchor: '邮箱',
        company: '公司邮箱',
      },
      render: () => <Input placeholder='请填写邮箱地址'/>,
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
      render: () => <Input.TextArea placeholder='请填写地址（精确到街道）'/>,
    },
    {
      name: 'password',
      label: {
        all: '登录密码',
      },
      render: () => <Input.Password placeholder='(选填，不填仅能用验证码登录)'/>,
    },
    {
      name: 'tags',
      label: {
        all: '标签类别',
      },
      render: (data) => (
        <Select
          mode="multiple"
          allowClear
          optionFilterProp="children"
        >
          {allTags.map((item: Tag) => <Option key={item.id}>{item.name}</Option>)}
        </Select>
      ),
    },
    {
      name: 'introduce',
      label: {
        all: '简介',
      },
      render: () => <Input.TextArea placeholder='介绍一下自己，可以让别人更快了解你'/>,
    },
  ];
  return (
    <div className='register-page'>
      <div className="register-wrapper">
        <h1 className='title'>欢迎入驻Allen电商直播平台</h1>
        <h3 className='title-sub'>请告诉我们一些基本信息</h3>
        <div className="form-wrapper">
          <div className="form-left"></div>
          <Form
            form={form}
            onFinish={(v) => onFinish(v, form, submit)}
            className='form-content'
            labelCol={{ span: FORM_COL.label }}
            wrapperCol={{ span: FORM_COL.wrapper }}
          >
            <BaseFormItem infos={UserRenderInfos} isAnchor={isAnchor} />
            <Form.Item wrapperCol={{ offset: FORM_COL.label, span: FORM_COL.wrapper }}>
              <Button loading={transition.state === LOAD_STATE.submitting} type='primary' style={{ marginRight: 20 }} htmlType='submit'>提交</Button>
              <Button htmlType='reset'>重置</Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

function changeRole(form: FormInstance, setIsAnchor: Function) {
  const curRole = form.getFieldValue('role');
  const isAnchor = curRole === Role.ANCHOR;
  setIsAnchor(isAnchor ? true : false);
}

function onFinish(values: any, form: FormInstance, submit: SubmitFunction) {
  values.tags = formatTags(values.tags);
  const formatValues = formatFormData(values);
  // if (fileObj) {
  //   uploadImage(formatValues.avatarKey, fileObj);
  // }
  submit(formatValues, {
    action: '/register',
    method: 'post',
  });
};
