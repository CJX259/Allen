import React from 'react';
import { useLoaderData, useActionData } from 'remix';
import { Form, Input, Button } from 'antd';


export default function RegisterCmp() {
  const phone = useLoaderData();
  return (
    <div className='register-page'>
      <div className="register-wrapper">
        <h1 className='title'>欢迎入驻Allen电商直播平台</h1>
        <img src="/assets/images/logo.svg" alt="" />
        <Form>
        </Form>
      </div>
    </div>
  );
};
