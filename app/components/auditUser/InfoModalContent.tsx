import React from 'react';
import { UserJoinTag } from '~/types';
import { Form } from 'antd';
import BaseFormItem from '~/components/register/BaseFormItem';
import { Role } from '@prisma/client';
import { infoRenderInfo } from '~/const';
import { getImgUrl } from '~/utils/cos';
import useIsomorphicLayoutEffect from '~/utils';

const FORM_COL = {
  label: 8,
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
  useIsomorphicLayoutEffect(() => {
    if (data?.avatarKey) {
      getImgUrl(data.avatarKey, (data) => {
        const imgDom = document.getElementById('avatar') as any;
        imgDom.src = data.Url;
      });
    }
  }, [data?.avatarKey]);

  const renderIframe = () => {
    return (
      <>
        <h2>
          <a target="_blank" rel="noreferrer" href={`https://www.tianyancha.com/search?key=${data.name}`}>公司信息核实地址</a>
        </h2>
        {/* <div className='iframe-wrapper'>
          <iframe src={`https://www.tianyancha.com/search?key=${data.name}`} />
        </div> */}
      </>
    );
  };

  return (
    <div className='modal-wrapper'>
      <Form
        form={form}
        className='audit-form'
        labelCol={{ span: FORM_COL.label }}
        wrapperCol={{ span: FORM_COL.wrapper }}
        onFinish={finish}
      >
        <BaseFormItem data={data} infos={infoRenderInfo} isAnchor={data?.role === Role.ANCHOR} />
      </Form>
      {data.role === Role.COMPANY && renderIframe()}
    </div>
  );
}
