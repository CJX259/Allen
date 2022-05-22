import React, { useState, useEffect } from 'react';
import { Row, Col, Input, Button, message } from 'antd';
import { useFetcher } from 'remix';

import { LOGIN_METHOD } from '~/types';
import useValuesRef from './useValueRef';
import { CODE_WAITING, LOAD_STATE, LOAD_TYPE, LoginFormSpan } from '../../const';

// 实现渲染密码还是验证码的逻辑,处理倒计时逻辑
export default function RenderCodeOrPassword(props: {loginMethod: LOGIN_METHOD, phone: string}) {
  const { loginMethod, phone } = props;
  const fetcher = useFetcher();
  const [second, setSecond] = useState(0);
  const [loading, setLoading] = useState(false);

  // 使用ref保存当前已过时间，否则每次定时器setSecond后都是新的初始值
  const latestSecond = useValuesRef(second); // useValuesRef
  const codeLoginOps = {
    needSend: true,
    name: 'code',
    wording: '验证码',
  };
  const pswLoginOps = {
    needSend: false,
    name: 'password',
    wording: '密码',
  };
  let curLoginMethod = codeLoginOps;
  if (loginMethod === LOGIN_METHOD.PASSWORD) {
    curLoginMethod = pswLoginOps;
  } else if (loginMethod === LOGIN_METHOD.CODE) {
    curLoginMethod = codeLoginOps;
  }
  let timer: NodeJS.Timeout;
  function clickCode() {
    // 发送验证码
    fetcher.submit({ phone }, {
      method: 'put',
    });
  }

  // 根据fetcher处理前端逻辑
  useEffect(() => {
    if (fetcher.type === LOAD_TYPE.actionSubmission) {
      // 提交中
      setLoading(true);
    } else if (fetcher.type === LOAD_TYPE.done) {
      // 没错误则开始倒计时
      if (fetcher.data === '发送成功') {
        // 当发送完后，开启倒计时
        startTime(latestSecond, setSecond, timer);
      } else {
        // 有错误则打印错误信息
        message.error(fetcher.data.msg || fetcher.data);
      }
    }
    if (fetcher.state === LOAD_STATE.idle) {
      // 无论成功与否，请求完都取消加载状态
      setLoading(false);
    }
    return () => {
      // 防止异步的回调中调用了setState，导致内存溢出
      clearInterval(timer);
    };
  }, [fetcher]);
  return (
    <Row>
      <Col span={LoginFormSpan.label}><label className='label' htmlFor={curLoginMethod.name}>{curLoginMethod.wording}：</label></Col>
      <Col span={LoginFormSpan.input}>
        <div className='psw-input'>
          {curLoginMethod.needSend ?
            <>
              <Input placeholder={`请输入${curLoginMethod.wording}`} name={curLoginMethod.name} />
              <Button className='code-btn' loading={loading} disabled={!!second} onClick={clickCode}>{second ? `重新发送(${CODE_WAITING - second})` : '发送验证码'}</Button>
            </> :
            <Input.Password name={curLoginMethod.name}/>
          }
        </div>
      </Col>
    </Row>
  );
};

/**
 * 前端开启倒计时
 *
 * @param {React.MutableRefObject<number>} refSecond
 * @param {Function} setSecond
 * @param {NodeJS.Timeout} timer
 */
function startTime(refSecond: React.MutableRefObject<number>, setSecond: Function, timer: NodeJS.Timeout) {
  message.success('发送成功');
  // 实现点击就直接开始倒计时的效果，不然要等1秒后视图才开始倒计时
  setSecond(1);
  refSecond.current = 1;
  timer = setInterval(() => {
    if (refSecond.current === CODE_WAITING) { // 此处判断latestCount.current，而不是second
      clearInterval(timer);
      setSecond(0);
      return;
    }
    setSecond(++refSecond.current);
  }, 1000);
}
