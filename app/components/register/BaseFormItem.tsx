import React from 'react';
import { Form } from 'antd';
import { FormRenderInfo, UserJoinTag } from '~/types';

export default function BaseFormItem(props: { data?: UserJoinTag, infos: FormRenderInfo[], isAnchor: boolean}) {
  const { infos, isAnchor, data } = props;
  const res = infos.map((ele: FormRenderInfo) => {
    return (
      <Form.Item
        key={ele.name}
        label={ele.label.all ? ele.label.all : ( isAnchor ? ele.label.anchor : ele.label.company)}
        name={ele.name}
        style={ele.style}
        rules={ele.rules ? ele.rules : undefined}
        initialValue={ele.initialValue ? ele.initialValue(data ? data : null) : undefined}
      >
        {ele.render(data ? data : null)}
      </Form.Item>
    );
  });
  return (
    <>
      {res}
    </>
  );
};
