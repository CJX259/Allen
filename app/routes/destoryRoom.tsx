import { Role } from '@prisma/client';
import React, { useEffect } from 'react';
import { ActionFunction, json, useActionData, useTransition, Form, LoaderFunction } from 'remix';
import { PARAMS_ERROR } from '~/error';
import { ERROR, SUCCESS } from '~/types';
import { needLogined } from '~/utils/loginUtils';
import { destoryRoom } from '~/utils/liveRoomManager';
import { Button, Input, message, Space } from 'antd';

export const loader: LoaderFunction = async ({ request }) => {
  const redirect = await needLogined(request, [Role.ADMIN]);
  if (redirect) {
    return redirect;
  }
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  const redirect = await needLogined(request, [Role.ADMIN]);
  if (redirect) {
    return redirect;
  }
  // 表单数据
  const formData = await request.formData();
  const userId = formData.get('userId');
  const numberReg = /^\d+$/;
  if (!userId || !numberReg.test(userId.toString())) {
    return json(PARAMS_ERROR);
  }
  try {
    console.log('执行destory');
    // 本系统中直播间id就是用户id
    const data = await destoryRoom(+userId);
    return json({
      ...data,
    } as SUCCESS);
  } catch (error: any) {
    return json({
      msg: error.message,
    });
  }
};

export default function LiveRoomManager() {
  const actionData: ERROR & SUCCESS | undefined = useActionData();
  const transition = useTransition();
  useEffect(() => {
    if (actionData?.msg) {
      message.error(actionData.msg);
    } else if (actionData?.success) {
      message.success('关闭成功');
    }
  }, [actionData]);
  return (
    <>
      <Form method='post'>
        <Space direction='vertical'>
          <h3>关闭直播间</h3>
          <div className="form-item">
            <Space>
              <label htmlFor='userId'>主播ID:  </label>
              <Input id='userId' placeholder='请输入主播ID' name='userId' />
              <Button loading={transition.state !== 'idle'} type="primary" htmlType='submit'>关闭</Button>
            </Space>
          </div>
        </Space>
      </Form>
    </>
  );
};


export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return (
    <div>
      <h1>500</h1>
      <h2>服务器出错</h2>
      <h3>{error.message}</h3>
    </div>
  );
};
