import { Input, Rate } from 'antd';
import React from 'react';
import { ORDER_COMMNET } from '~/const';
import { OrderDoneOpts } from '~/types';

const desc = ['糟糕', '还行', '不错', '良好', '优秀'];

export default function DoneForm(props:
  {
    setOpts: Function;
    opts: OrderDoneOpts;
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
      <div className="form-item">
        <span className="label">请给对方打分: </span>
        <Rate
          className='comment-rate'
          style={{ width: 200 }}
          tooltips={desc}
          onChange={(e) => handleChange(ORDER_COMMNET.rating, e)}
          defaultValue={opts.rating}
        />
      </div>
      <div className="form-item comment-wrapper">
        <span className="label">请给对方评论: </span>
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
