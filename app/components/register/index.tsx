import React, { useState } from 'react';
import { useLoaderData, useActionData, useSubmit } from 'remix';
import { Form, Input, Button, Radio } from 'antd';
import type { FormInstance } from 'antd';
import type { SubmitFunction } from 'remix';
import BaseFormItem from './BaseFormItem';
import { userRenderInfos } from './const';

import { Role } from '@prisma/client';

export default function RegisterCmp() {
  const phone = useLoaderData();
  const [form] = Form.useForm();
  const submit = useSubmit();
  // 是否为主播，用于表单label判断
  const [isAnchor, setIsAnchor] = useState(true);
  return (
    <div className='register-page'>
      <div className="register-wrapper">
        <h1 className='title'>欢迎入驻Allen电商直播平台</h1>
        <h3 className='title-sub'>请告诉我们一些基本信息</h3>
        <div className="form-wrapper">
          <Form
            form={form}
            onFinish={(v) => onFinish(v, submit)}
            className='form-content'
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 8 }}
          >
            <Form.Item
              label='手机号'
              required
              name='phone'
              initialValue={phone}
            >
              <Input disabled />
            </Form.Item>
            <Form.Item
              label='您的身份是：'
              name='role'
              required
            >
              <Radio.Group onChange={() => changeRole(form, setIsAnchor)}>
                <Radio value={Role.ANCHOR}>主播</Radio>
                <Radio value={Role.COMPANY}>供应商</Radio>
              </Radio.Group>
            </Form.Item>
            <BaseFormItem infos={userRenderInfos} isAnchor={isAnchor} />
            <Form.Item
              label='简介'
              name='introduce'
            >
              <Input.TextArea />
            </Form.Item>
            <Button htmlType='submit'>提交</Button>
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

function onFinish(values: any, submit: SubmitFunction) {
  console.log('value', values);
  submit(values, {
    action: '/register',
    method: 'post',
  });
};
