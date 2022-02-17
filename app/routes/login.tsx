import { Form } from 'remix';
import React from 'react';
import { Button, Input } from 'antd';


/**
 * 登录页表单
 *
 * @export
 * @return {*}
 */
export default function Login() {
  return (
    <>
      <Form>
        <Input />
        <Button>jessy按钮</Button>
      </Form>
    </>
  );
}
