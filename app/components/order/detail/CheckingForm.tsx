import { Form, Input, Radio } from 'antd';
import React from 'react';
import { ORDER_EXPRESS_PARAMS } from '~/const';
import { OrderCheckingOpts, SessionUserData } from '~/types';

export default function CheckingForm(props: {
  pendding: boolean;
  opts: OrderCheckingOpts;
  setOpts: Function;
  curUser: SessionUserData;
  }) {
  // 把数据传递到父级，父级调用api
  const { setOpts, opts, pendding } = props;
  const handleChange = (key: string, value: string) => {
    setOpts({
      ...opts,
      [key]: value,
    });
  };
  return (
    <div className='checking-form'>
      <Form.Item label="请选择快递公司: " initialValue={opts[ORDER_EXPRESS_PARAMS.expressType] || ''} labelCol={{ span: 3 }} wrapperCol={{ span: 15 }}>
        <Radio.Group disabled={pendding} onChange={(e) => handleChange(ORDER_EXPRESS_PARAMS.expressType, e.target.value)}>
          <Radio value={'顺丰快递'}>顺丰快递</Radio>
          <Radio value={'京东快递'}>京东快递</Radio>
          <Radio value={'韵达快递'}>韵达快递</Radio>
          <Radio value={'圆通快递'}>圆通快递</Radio>
          <Radio value={'中通快递'}>中通快递</Radio>
          <Radio value={'其他快递'}>
            其他快递:
            <Input
              onChange={(e) => handleChange(ORDER_EXPRESS_PARAMS.tips, e.target.value)}
              disabled={pendding}
              value={opts[ORDER_EXPRESS_PARAMS.tips] || ''}
              style={{ width: 100, marginLeft: 10 }}
            />
          </Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item initialValue={opts[ORDER_EXPRESS_PARAMS.expressNum] || ''} label="请输入快递单号: " labelCol={{ span: 3 }} wrapperCol={{ span: 8 }}>
        <Input
          onChange={(e) => handleChange(ORDER_EXPRESS_PARAMS.expressNum, e.target.value)}
          disabled={pendding}
        />
      </Form.Item>
    </div>
  );
}
