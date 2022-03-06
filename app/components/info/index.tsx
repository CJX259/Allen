import { Role } from '@prisma/client';
import { Button, Form, Input, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { useActionData, useLoaderData, useSubmit, useTransition } from 'remix';
import { LOAD_STATE } from '~/const';
import { ERROR, FormRenderInfo, UserJoinTag } from '~/types';
import { formatFormData, uploadImage, validateRepeat } from '~/utils/client.index';
import { getImgUrl } from '~/utils/cos';
import BaseFormItem from '../register/BaseFormItem';
import { FORM_COL, RULE_REQUIRED } from '../register/const';
import UploadImg from '../UploadImg';

export default function InfoIndex() {
  const actionData: ERROR & { id: number } | undefined = useActionData();
  const loaderData: UserJoinTag = useLoaderData();
  // 上传图片组件传回的头像图片数据
  const [avatarFileObj, setAvatarFileObj] = useState(null as any);
  const [avatarimgUrl, setAvatarImgUrl] = useState('');
  const submit = useSubmit();
  const [form] = Form.useForm();
  const transition = useTransition();

  // 数据更新后，重新拉取图片url
  useEffect(() => {
    if (loaderData.avatarKey) {
      getImgUrl(loaderData.avatarKey, (data) => {
        setAvatarImgUrl(data.Url);
      });
    }
  }, [loaderData]);

  // 显示出错信息
  useEffect(() => {
    if (actionData?.msg) {
      message.error(actionData.msg);
    }
    if (actionData?.id) {
      message.success('数据更新成功');
    }
  }, [actionData]);

  // 提交数据
  function onFinish(v: any) {
    const params = formatFormData(v);
    // 先不传图片到云端
    if (avatarFileObj) {
      uploadImage(params.avatarKey, avatarFileObj);
    }
    submit(params, {
      method: 'post',
    });
  }
  // 审核查看信息渲染form字段
  const infoRenderInfo: FormRenderInfo[] = [
    {
      name: 'avatarKey',
      label: {
        all: '头像',
      },
      render: (data) => {
        return <UploadImg imgUrl={avatarimgUrl} setFileObj={setAvatarFileObj} />;
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
      name: 'password',
      label: {
        all: '登录密码',
      },
      render: () => <Input.Password placeholder='(选填，不填仅能用验证码登录)'/>,
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
        <Form.Item wrapperCol={{ offset: FORM_COL.label, span: FORM_COL.wrapper }}>
          <h2>个人信息表</h2>
        </Form.Item>
        <Form.Item style={{ display: 'none'}} initialValue={loaderData.id} name='id'>
        </Form.Item>
        <BaseFormItem data={loaderData} infos={infoRenderInfo} isAnchor={loaderData.role === Role.ANCHOR} />
        <Form.Item wrapperCol={{ offset: FORM_COL.label, span: FORM_COL.wrapper }}>
          <Button loading={transition.state === LOAD_STATE.submitting} type='primary' htmlType='submit'>提交</Button>
        </Form.Item>
      </Form>
    </div>
  );
}
