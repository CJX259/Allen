import React, { useLayoutEffect } from 'react';
import { UserJoinTag } from '~/types';
import { Form } from 'antd';
import BaseFormItem from '~/components/register/BaseFormItem';
import { Role } from '@prisma/client';
import { infoRenderInfo } from '~/const';
import { getImgUrl } from '~/utils/cos';

const FORM_COL = {
  label: 6,
  wrapper: 10,
};

export default function ModalContent(props: { data?: UserJoinTag }) {
  const { data } = props;
  if (!data) {
    return <span>暂无数据</span>;
  }
  const [form] = Form.useForm();
  function finish(value: any) {
    console.log('value', value);
  }
  useLayoutEffect(() => {
    if (data?.avatarKey) {
      getImgUrl(data.avatarKey, (data) => {
        const imgDom = document.getElementById('avatar') as any;
        imgDom.src = data.Url;
      });
    }
  }, [data?.avatarKey]);

  return (
    <Form
      form={form}
      className='audit-form'
      labelCol={{ span: FORM_COL.label }}
      wrapperCol={{ span: FORM_COL.wrapper }}
      onFinish={finish}
    >
      <BaseFormItem data={data} infos={infoRenderInfo} isAnchor={data?.role === Role.ANCHOR} />
    </Form>
  );
}
