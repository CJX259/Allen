import React, { useLayoutEffect } from 'react';
import { FormRenderInfo, UserJoinTag } from '~/types';
import { Form, Input, Tag } from 'antd';
import Cos from 'cos-js-sdk-v5';
import BaseFormItem from '~/components/register/BaseFormItem';
import config from '~/../cloudConfig.json';
import { Role, Status } from '@prisma/client';
import { ROLE_MAP } from '~/const';

const FORM_COL = {
  label: 6,
  wrapper: 10,
};

export default function ModalContent(props: { data?: UserJoinTag }) {
  const { data } = props;
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
  const UserRenderInfos: FormRenderInfo[] = [
    {
      name: 'name',
      label: {
        anchor: '昵称',
        company: '公司名称',
      },
      render: () => <span className='form-item-name'>
        {data?.name}
        {data?.role && <Tag style={{ marginLeft: 10 }} color={data.role === Role.ANCHOR ? 'green' : 'red'}>{ROLE_MAP[data?.role]}</Tag>}
      </span>,
    },
    {
      name: 'avatarKey',
      label: {
        all: '头像',
      },
      render: () => {
        return <img id='avatar' src="" alt="" />;
      },
    },
    {
      name: 'phone',
      label: {
        all: '手机号',
      },
      initialValue: data?.phone,
      render: () => <Input disabled/>,
    },
    {
      name: 'vx',
      label: {
        all: '微信号',
      },
      initialValue: data?.phone,
      render: () => <Input disabled />,
    },
    {
      name: 'realName',
      label: {
        anchor: '真实姓名',
        company: '公司法人姓名',
      },
      render: () => <span className='form-item-real-name'>{data?.realName}</span>,
    },
    {
      name: 'idCard',
      label: {
        anchor: '身份证号码',
        company: '公司法人身份证号码',
      },
      render: () => <span className='form-item-idcard'>{data?.idCard}</span>,
    },
    {
      name: 'mail',
      label: {
        anchor: '邮箱',
        company: '公司邮箱',
      },
      render: () => <span className='form-item-mail'>{data?.idCard}</span>,
    },
    {
      name: 'reason',
      label: {
        all: '拒绝原因',
      },
      initialValue: data?.reason ? data.reason : '',
      render: () => data?.status === Status.REJECT ? <Input.TextArea disabled /> : <span>无</span>,
    },
    {
      name: 'address',
      label: {
        anchor: '现居地址',
        company: '公司地址',
      },
      initialValue: data?.address ? data.address : '',
      render: () => <Input.TextArea disabled />,
    },
    {
      name: 'introduce',
      label: {
        all: '简介',
      },
      initialValue: data?.introduce ? data.introduce : '',
      render: () => <Input.TextArea disabled />,
    },
  ];
  return (
    <Form
      form={form}
      className='audit-form'
      labelCol={{ span: FORM_COL.label }}
      wrapperCol={{ span: FORM_COL.wrapper }}
      onFinish={finish}
    >
      <BaseFormItem infos={UserRenderInfos} isAnchor={data?.role === Role.ANCHOR} />
    </Form>
  );
}
