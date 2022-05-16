import { DatePicker } from 'antd';
import React from 'react';
import { OrderDoingOpts } from '~/types';
import moment from 'moment';
import { ORDER_LIVE_INFO } from '~/const';

export default function DoingForm(props: {
    setOpts?: Function;
    opts: OrderDoingOpts;
    disable: boolean;
  }) {
  const { setOpts, opts, disable } = props;
  const defaultTime = opts.time ? moment(opts.time * 1000) : undefined;
  console.log('default', defaultTime);
  const changeTime = (e: moment.Moment | null) => {
    if (e) {
      handleChange(ORDER_LIVE_INFO.time, Math.floor(e?.valueOf() / 1000));
    }
  };

  const handleChange = (key: string, value: string | number) => {
    setOpts && setOpts({
      ...opts,
      [key]: value,
    });
  };
  return (
    <div className='doing-form'>
      <div className="form-item">
        <span className="label"><span className='label-word'>{disable ? '本次' : '填写'}直播时间: </span></span>
        <DatePicker
          className='time-picker'
          showTime={{
            defaultValue: moment('00:00:00', 'HH:mm:ss'),
          }}
          defaultValue={defaultTime}
          onChange={changeTime}
          disabled={disable}
        />
      </div>
      {/* <div className="form-item">
        <span className="label">{disable ? '本次' : '填写'}填写直播间地址: </span>
        <Input
          onChange={(e) => handleChange(ORDER_LIVE_INFO.liveUrl, e.target.value)}
          className='url-input'
          defaultValue={opts.liveUrl}
          disabled={disable}
        />
      </div> */}
    </div>
  );
}
