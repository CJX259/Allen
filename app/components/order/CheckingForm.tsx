import { Input } from 'antd';
import React, { useState } from 'react';
import { SessionUserData } from '~/types';

export default function CheckingForm(props: { setOpts: Function; curUser: SessionUserData}) {
  const { setOpts } = props;
  const [expressNum, setExpressNum] = useState('');
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setExpressNum(e.target.value);
    setOpts({
      expressNum: e.target.value,
    });
  };
  return (
    <div>
      <span>请输入快递单号: </span>
      <Input value={expressNum} onChange={handleChange} />
    </div>
  );
}
