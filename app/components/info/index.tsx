import { Role, Status } from '@prisma/client';
import { Button, Form, Input, InputNumber, message, Popconfirm, Select, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { useActionData, useLoaderData, useSubmit, useTransition } from 'remix';
import { AUDIT_STATUS_MAP, LOAD_STATE } from '~/const';
import { ERROR, FormRenderInfo, InfoLoaderData } from '~/types';
import { formatFormData, formatTags, sendOrder, validateRepeat } from '~/utils/client.index';
import { getImgUrl } from '~/utils/cos';
import BaseFormItem from '../register/BaseFormItem';
import { FORM_COL, RULE_REQUIRED } from '../register/const';
import RoleTag from '../RoleTag';
import UploadImg from '../UploadImg';
import CommentComp from './Comment';
import LiveTable from './LiveTable';

const { Option } = Select;

export default function InfoIndex() {
  const actionData: ERROR & { id: number } | undefined = useActionData();
  const loaderData: InfoLoaderData= useLoaderData();
  const {
    user,
    allTags,
    loginUser,
    commentData,
    liveData,
    dev,
  } = loaderData;
  const { id: loginId = -1, role: loginRole, status } = loginUser || {};
  const { comments, avgRating } = commentData || {};
  let isVisitor = user?.id !== loginId;
  // 上传图片组件传回的头像图片数据
  const [avatarimgUrl, setAvatarImgUrl] = useState('');
  const submit = useSubmit();
  const [form] = Form.useForm();
  const transition = useTransition();

  // 数据更新后，重新拉取图片url
  useEffect(() => {
    if (user.avatarKey) {
      getImgUrl(user.avatarKey, (data) => {
        setAvatarImgUrl(data.Url);
      });
    }
    isVisitor = user?.id !== loginId;
    form.resetFields();
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
    // submit貌似传不了数组类型，用字符代替，服务端再解析如'1,2,3'
    v.tags = formatTags(v.tags);
    // 防止传null与undefined（后台拿会变成字符'null'，难以处理。此处''不会被删掉）
    const params = formatFormData(v);
    submit(params, {
      method: 'post',
    });
  }

  // 渲染提交按钮
  function renderButton() {
    if (isVisitor) {
      return (
        <Popconfirm
          title="确定发起签约吗？"
          onConfirm={() => sendOrder(user?.id, user?.role, submit)}
          okText="确定"
          disabled={user?.role === loginRole || user?.status !== Status.RESOLVE || !loginRole || status === 'REJECT'}
          cancelText="取消"
        >
          <Button
            type='primary'
            disabled={user?.role === loginRole || user?.status !== Status.RESOLVE || !loginRole || status === 'REJECT'}
          >
            发起签约
          </Button>
        </Popconfirm>
      );
    }
    return (
      <Button
        loading={transition.state === LOAD_STATE.submitting}
        type='primary'
        htmlType='submit'
      >提交
      </Button>
    );
  };

  // 审核查看信息渲染form字段
  const infoRenderInfo: FormRenderInfo[] = [
    {
      name: 'avatarKey',
      label: {
        all: '头像',
      },
      initialValue: (data) => data?.avatarKey,
      render: (data) => {
        return isVisitor ?
          <img src={avatarimgUrl} style={{ width: 150, height: 150, borderRadius: '50%' }} alt="avatar" /> :
          <UploadImg imgUrl={avatarimgUrl} />;
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
      render: (data) => (
        isVisitor ?
        <span>{data?.name} <RoleTag role={data?.role}/></span> :
        <Input placeholder='请填写昵称(小于12个字符)' />
      ),
    },
    {
      name: 'status',
      label: {
        all: '状态',
      },
      initialValue: (data) => data?.status,
      render: (data) => {
        const { status } = data || {};
        let color = 'green';
        if (status === 'REJECT') {
          color = 'red';
        } else if (status === 'PENDING') {
          color = 'orange';
        }
        return (
          <>
            {status && <Tag color={color}>{AUDIT_STATUS_MAP[status]}</Tag>}
          </>
        );
      },
    },
    {
      name: 'phone',
      label: {
        all: '手机号',
      },
      rules: [RULE_REQUIRED],
      initialValue: (data) => data?.phone,
      render: (data) => (isVisitor ? <span>{data?.phone}</span> : <Input />),
    },
    {
      name: 'vx',
      label: {
        all: '微信号',
      },
      rules: [RULE_REQUIRED],
      initialValue: (data) => data?.vx,
      render: (data) => (isVisitor ? <span>{data?.vx}</span> : <Input />),
    },
    {
      name: 'realName',
      label: {
        anchor: '真实姓名',
        company: '公司法人姓名',
      },
      rules: [RULE_REQUIRED],
      style: isVisitor ? { display: 'none' } : {},
      initialValue: (data) => data?.realName,
      render: (data) => <Input disabled={isVisitor} placeholder='请填写真实姓名' />,
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
      style: isVisitor ? { display: 'none' } : {},
      initialValue: (data) => data?.idCard,
      render: (data) => <Input disabled={isVisitor} placeholder='请填写身份证号码' />,
    },
    {
      name: 'mail',
      label: {
        anchor: '邮箱',
        company: '公司邮箱',
      },
      initialValue: (data) => data?.mail,
      render: (data) => (isVisitor ? <span>{data?.mail}</span> : <Input placeholder='请填写邮箱地址' />),
      rules: [
        RULE_REQUIRED,
        {
          type: 'email',
          message: '邮箱格式不正确',
        },
      ],
    },
    {
      name: 'price',
      label: {
        all: '单场价格(元)',
      },
      initialValue: (data) => data?.price,
      render: (data) => (isVisitor ? <span>{data?.price}</span> : <InputNumber />),
    },
    // 最多选择2个标签，带搜索的多选select
    {
      name: 'tags',
      label: {
        all: '标签类别',
      },
      initialValue: (data) => data?.tags?.map((item) => '' + item.tagId),
      render: (data) => (
        <Select
          mode="multiple"
          allowClear
          disabled={isVisitor}
          optionFilterProp="children"
        >
          {allTags?.map((item, index) => <Option key={item.id}>{item.name}</Option>)}
        </Select>
      ),
    },
    {
      name: 'address',
      label: {
        anchor: '现居地址',
        company: '公司地址',
      },
      style: isVisitor ? { display: 'none' } : {},
      rules: [
        RULE_REQUIRED,
        {
          validator: async (rule, value) => {
            if (!value) {
              return Promise.resolve();
            }
            const addressReg = /([^省]+省|.+自治区|[^市]+市)([^自治州]+自治州|[^市]+市|[^盟]+盟|[^地区]+地区|.+区划)([^市]+市|[^县]+县|[^旗]+旗|.+区)/;
            return addressReg.test(value) ? Promise.resolve() : Promise.reject(new Error('地址格式有误'));
          },
        },
      ],
      initialValue: (data) => data?.address ? data.address : '',
      render: (data) => (isVisitor ? <span>{data?.address}</span> : <Input.TextArea placeholder='请填写地址（精确到街道）' />),
    },
    {
      name: 'introduce',
      label: {
        all: '简介',
      },
      initialValue: (data) => data?.introduce ? data.introduce : '',
      render: (data) => (isVisitor ? <span>{data?.introduce}</span> : <Input.TextArea placeholder='介绍一下自己，可以让别人更快了解你' />),
    },
  ];
  return (
    <div className="info-wrapper">
      <div className="form-content">
        <Form
          form={form}
          onFinish={onFinish}
          labelCol={{ span: FORM_COL.label }}
          wrapperCol={{ span: FORM_COL.wrapper }}
        >
          <h2>用户信息</h2>
          <Form.Item style={{ display: 'none'}} initialValue={user?.id} name='id'>
          </Form.Item>
          <BaseFormItem data={user} infos={infoRenderInfo} isAnchor={user?.role === Role.ANCHOR} />
          <Form.Item wrapperCol={{ offset: FORM_COL.label, span: FORM_COL.wrapper }}>
            {renderButton()}
          </Form.Item>
        </Form>
      </div>
      {/* 直播排表 */}
      <LiveTable dev={dev} loginUser={loginUser} data={liveData} />
      <div className="comment-content">
        <h2>用户评价 <Tag color="green">平均评分: {avgRating?.toFixed(1)}</Tag></h2>
        <CommentComp data={comments} />
      </div>
    </div>
  );
}

