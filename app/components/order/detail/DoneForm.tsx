import { Input, Rate } from 'antd';
import React from 'react';
import { ORDER_COMMNET } from '~/const';
import { OrderOpts } from '~/types';
import CheckingForm from './CheckingForm';
import DoingForm from './DoingForm';

const desc = ['糟糕', '还行', '不错', '良好', '优秀'];

export default function DoneForm(props:
  {
    setOpts: Function;
    opts: OrderOpts;
    disable: boolean;
  }) {
  const { setOpts, opts, disable } = props;
  const handleChange = (key: string, value: number | string) => {
    setOpts({
      ...opts,
      [key]: value,
    });
  };
  return (
    <div className='done-form'>
      <CheckingForm
        disable={true}
        opts={opts}
      />
      <DoingForm opts={opts} disable={true} />
      <div className="form-item">
        <span className="label"><span className='label-word'>请给对方打分: </span></span>
        <Rate
          className='comment-rate'
          style={{ width: 200 }}
          tooltips={desc}
          onChange={(e) => handleChange(ORDER_COMMNET.rating, e)}
          defaultValue={opts.rating}
        />
      </div>
      <div className="form-item comment-wrapper">
        <span className="label"><span className='label-word'>请给对方评论: </span></span>
        <Input.TextArea
          onChange={(e) => handleChange(ORDER_COMMNET.comment, e.target.value)}
          className='comment-input'
          defaultValue={opts.comment}
          disabled={disable}
        />
      </div>
    </div>
  );
}
