import { Input } from 'antd';
import React from 'react';


export default function RejectModalContent(props: { reason: string, setReason: Function }) {
  const { setReason, reason } = props;
  return (
    <div>
      <span>拒绝原因: </span>
      <Input.TextArea value={reason} onChange={(e) => setReason(e.target.value)} />
    </div>
  );
}
