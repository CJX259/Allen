import React, { useLayoutEffect } from 'react';
import { UserJoinTag } from '~/types';
import { Form } from 'antd';
import Cos from 'cos-js-sdk-v5';
import BaseFormItem from '~/components/register/BaseFormItem';
import config from '~/../cloudConfig.json';
import { Role } from '@prisma/client';
import { infoRenderInfo } from '~/const';

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
    const cos = new Cos({
      SecretId: config.SecretId,
      SecretKey: config.SecretKey,
    });
    cos.getObjectUrl({
      Bucket: 'sls-cloudfunction-ap-guangzhou-code-1301421790',
      Region: 'ap-guangzhou',
      Key: config.prefix + data?.avatarKey as string,
    }, function(err, data) {
      if (err) {
        console.log(err);
        return;
      }
      const imgDom = document.getElementById('avatar') as any;
      imgDom.src = data.Url;
    });
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
