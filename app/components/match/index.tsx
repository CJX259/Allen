import { Button, Spin } from 'antd';
import React from 'react';
import { useActionData, useSubmit, useTransition } from 'remix';
import { MATCH_TYPES } from '~/types';

export default function MatchIndex() {
  const transition = useTransition();
  const submit = useSubmit();
  const actionData = useActionData();
  console.log('actionData', actionData);
  function startMatch(type: MATCH_TYPES) {
    submit({
      type: MATCH_TYPES.COST_EFFECTIVE,
    }, { method: 'post' });
  }
  return (
    <Spin tip="匹配中..." spinning={transition.state !== 'idle'}>
      <div className="match-wrapper">
        <Button
          onClick={() => startMatch(MATCH_TYPES.DEFAULT)}
        >开始匹配</Button>
      </div>
    </Spin>
  );
}
