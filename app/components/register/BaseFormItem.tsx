import React from 'react';
import { Form } from 'antd';
import { FormRenderInfo } from '~/types';

export default function BaseFormItem(props: { infos: FormRenderInfo[], isAnchor: boolean}) {
  const { infos, isAnchor } = props;
  const res = infos.map((ele: FormRenderInfo) => {
    return (
      <Form.Item
        key={ele.name}
        label={ele.label.all ? ele.label.all : ( isAnchor ? ele.label.anchor : ele.label.company)}
        name={ele.name}
        required={ele.required}
      >
        {ele.render()}
      </Form.Item>
    );
  });
  return (
    <>
      {res}
    </>
  );
};
