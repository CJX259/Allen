import { Input, Radio } from 'antd';
import React from 'react';
import { ORDER_EXPRESS_PARAMS } from '~/const';
import { OrderCheckingOpts } from '~/types';

export default function CheckingForm(props: {
    disable: boolean;
    opts: OrderCheckingOpts;
    setOpts?: Function;
  }) {
  // 把数据传递到父级，父级调用api
  const { setOpts, opts, disable } = props;
  const handleChange = (key: string, value: string) => {
    setOpts && setOpts({
      ...opts,
      [key]: value,
    });
  };
  return (
    <div className='checking-form'>
      <div className="form-item">
        <span className='label'>{disable ? '本次选用的' : '请填写'}快递公司: </span>
        <Radio.Group
          disabled={disable}
          defaultValue={opts.expressType}
          onChange={(e) => handleChange(ORDER_EXPRESS_PARAMS.expressType, e.target.value)}
          className="type-group"
        >
          <Radio value={'顺丰快递'}>顺丰快递</Radio>
          <Radio value={'京东快递'}>京东快递</Radio>
          <Radio value={'韵达快递'}>韵达快递</Radio>
          <Radio value={'圆通快递'}>圆通快递</Radio>
          <Radio value={'中通快递'}>中通快递</Radio>
          <Radio value={'其他快递'}>
            其他快递:
            <Input
              onChange={(e) => handleChange(ORDER_EXPRESS_PARAMS.tips, e.target.value)}
              disabled={disable}
              value={opts.tips}
              style={{ width: 100, marginLeft: 10 }}
            />
          </Radio>
        </Radio.Group>
      </div>
      <div className="form-item">
        <span className='label'>{disable ? '本次' : '请填写'}寄往主播的快递单号: </span>
        <Input
          className='num-input'
          defaultValue={opts.expressNum}
          onChange={(e) => handleChange(ORDER_EXPRESS_PARAMS.expressNum, e.target.value)}
          disabled={disable}
        />
      </div>
      <div className="form-item">
        <span className='label'>{disable ? '本次' : '请填写'}寄往平台的快递单号: </span>
        <Input
          className='num-input'
          defaultValue={opts.sysExpressNum}
          onChange={(e) => handleChange(ORDER_EXPRESS_PARAMS.sysExpressNum, e.target.value)}
          disabled={disable}
        />
      </div>
    </div>
  );
}
