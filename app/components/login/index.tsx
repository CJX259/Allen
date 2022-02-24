import { Form, useActionData, useTransition } from 'remix';
import React, { useEffect, useState } from 'react';
import { Button, Input, message, Row, Col } from 'antd';
import { ERROR, LOGIN_METHOD } from '../../types';
import { LOAD_STATE, LoginFormSpan } from '~/const';
import RenderCodeOrPassword from './pswOrCode';

/**
 * 登录页表单
 *
 * @export
 * @return {*}
 */
export default function Login() {
  const errorData: ERROR | undefined = useActionData();
  const transition = useTransition();
  const [loginMethod, setLoginMethod] = useState(LOGIN_METHOD.CODE);
  const [phone, setPhone] = useState('');
  useEffect(() => {
    errorData?.msg ? message.error(errorData.msg) : '';
  }, [errorData]);
  return (
    <div className='login-wrapper'>
      <h1 className='header'>登录</h1>
      <Form method='post'>
        <Row>
          <Col span={LoginFormSpan.label}><label className='label' htmlFor="phone">账号：</label></Col>
          <Col span={LoginFormSpan.input}>
            <Input placeholder='请输入手机号码' value={phone} onChange={(e) => setPhone(e.target.value)} name='phone'/>
          </Col>
        </Row>
        <RenderCodeOrPassword loginMethod={loginMethod} phone={phone} />
        <Row>
          <Col span={LoginFormSpan.label} />
          <Col span={LoginFormSpan.input}>
            <Button type="link" onClick={() => changeLoginMethod(loginMethod, setLoginMethod)}>
              {loginMethod === LOGIN_METHOD.CODE ? '密码登录' : '验证码登录'}
            </Button>
            <Button
              type='primary'
              style={{
                float: 'right',
              }}
              htmlType='submit'
              loading={transition.state === LOAD_STATE.submitting}
            >登录 / 注册</Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
}

function changeLoginMethod(loginMethod: LOGIN_METHOD, setLoginMethod: Function) {
  setLoginMethod(loginMethod === LOGIN_METHOD.CODE ?
    LOGIN_METHOD.PASSWORD :
    LOGIN_METHOD.CODE);
};

