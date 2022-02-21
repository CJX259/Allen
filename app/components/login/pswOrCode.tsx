import React, { useState, useEffect } from 'react';
import { Row, Col, Input, Button } from 'antd';

import { LOGIN_METHOD } from '~/types';
import useValuesRef from './useValueRef';
import { CODE_WAITING, LoginFormSpan } from '../../const';

// 实现渲染密码还是验证码的逻辑,处理倒计时逻辑
export default function renderCodeOrPassword(loginMethod: LOGIN_METHOD, phone: string) {
  const [second, setSecond] = useState(0);

  // 使用ref保存当前已过时间，否则每次定时器setSecond后都是新的初始值
  const latestSecond = useValuesRef(second); // useValuesRef

  // 验证码倒计时
  let needSend = true;
  let name = 'code';
  let wording = '验证码';
  if (loginMethod === LOGIN_METHOD.PASSWORD) {
    needSend = false;
    name = 'password';
    wording = '密码';
  }
  let timer: NodeJS.Timeout;
  function clickCode() {
    // 实现点击就直接开始倒计时的效果，不然要等1秒后视图才开始倒计时
    // 会导致一个bug，就是设置为1，然后如果
    setSecond(1);
    latestSecond.current = 1;
    timer = setInterval(() => {
      if (latestSecond.current === CODE_WAITING) { // 此处判断latestCount.current，而不是second
        clearInterval(timer);
        setSecond(0);
        return;
      }
      setSecond(++latestSecond.current);
    }, 1000);
    // 发送验证码
    sendCode(phone);
  }
  useEffect(() => {
    return () => {
      clearInterval(timer);
    };
  }, []);
  return (
    <Row>
      <Col span={LoginFormSpan.label}><label className='label' htmlFor={name}>{wording}：</label></Col>
      <Col span={LoginFormSpan.input}>
        <div className='psw-input'>
          {needSend ?
            <>
              <Input id={name} name={name} />
              <Button className='code-btn' disabled={!!second} onClick={clickCode}>{second ? `重新发送(${CODE_WAITING - second})` : '发送验证码'}</Button>
            </> :
            <Input.Password name={name}/>
          }
        </div>
      </Col>
    </Row>
  );
};

function sendCode(phone: string) {
  // 发送验证码
  // 1、获取号码框输入的内容
  // 2、调用api发送，传入号码
  // 3、服务端生成随机数，存至session，且等待登录表单信息
}
