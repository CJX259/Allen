import { Role } from '@prisma/client';
import { Button, Form } from 'antd';
import React from 'react';
import { useLoaderData, useTransition } from 'remix';
import { LOAD_STATE } from '~/const';
import { UserJoinTag } from '~/types';
import BaseFormItem from '../register/BaseFormItem';
import { FORM_COL } from '../register/const';

export default function InfoIndex() {
  const loaderData: UserJoinTag = useLoaderData();
  const [form] = Form.useForm();
  const transition = useTransition();
  function onFinish() {
    return null;
  }
  return (
    <div className="info-wrapper">
      <Form
        form={form}
        onFinish={onFinish}
        className='form-content'
        labelCol={{ span: FORM_COL.label }}
        wrapperCol={{ span: FORM_COL.wrapper }}
      >
        <BaseFormItem infos={[]} isAnchor={loaderData.role === Role.ANCHOR} />
        <Form.Item wrapperCol={{ offset: FORM_COL.label, span: FORM_COL.wrapper }}>
          <Button loading={transition.state === LOAD_STATE.submitting} type='primary' style={{ marginRight: 20 }} htmlType='submit'>提交</Button>
        </Form.Item>
      </Form>
    </div>
  );
}
