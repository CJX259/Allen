import { DatePicker, Input } from 'antd';
import React from 'react';
import { OrderDoingOpts } from '~/types';
import moment from 'moment';
import { ORDER_LIVE_INFO, TIME_FORMAT } from '~/const';

export default function DoingForm(props: {
    setOpts?: Function;
    opts: OrderDoingOpts;
    disable: boolean;
  }) {
  const { setOpts, opts, disable } = props;
  const defaultTime = opts.time ? moment(opts.time) : undefined;
  const changeTime = (e: moment.Moment | null) => {
    const formatTime = e?.format(TIME_FORMAT);
    if (formatTime) {
      handleChange(ORDER_LIVE_INFO.time, formatTime);
    }
  };

  const handleChange = (key: string, value: string) => {
    setOpts && setOpts({
      ...opts,
      [key]: value,
    });
  };
  return (
    <div className='doing-form'>
      <div className="form-item">
        <span className="label">{disable ? '本次' : '填写'}直播时间: </span>
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
      <div className="form-item">
        <span className="label">{disable ? '本次' : '填写'}填写直播间地址: </span>
        <Input
          onChange={(e) => handleChange(ORDER_LIVE_INFO.liveUrl, e.target.value)}
          className='url-input'
          defaultValue={opts.liveUrl}
          disabled={disable}
        />
      </div>
    </div>
  );
}
