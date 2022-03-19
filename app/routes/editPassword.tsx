import {
  ActionFunction,
  Form,
  json,
  LoaderFunction,
  useActionData,
  useTransition,
} from 'remix';
import React, { useEffect } from 'react';
import { Button, Input, message, Space } from 'antd';
import { ERROR, SUCCESS } from '~/types';
import { getSessionUserData, needLogined } from '~/utils/loginUtils';
import { db } from '~/utils/db.server';
import { DB_ERROR, PARAMS_ERROR, PASSWORD_ERROR } from '~/error';
import md5 from 'md5';

export const loader: LoaderFunction = async () => {
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  const redirect = await needLogined(request);
  if (redirect) {
    return redirect;
  }
  const curUser = await getSessionUserData(request);
  const { id } = curUser;
  // 表单数据
  const formData = await request.formData();
  const oldPassword = formData.get('oldPassword');
  const newPassword = formData.get('newPassword');
  if (!oldPassword || !newPassword) {
    return json(PARAMS_ERROR);
  }
  try {
    const userInfo = await db.user.findUnique({
      where: {
        id,
      },
      select: {
        password: true,
      },
    });
    if (md5(oldPassword as string) !== userInfo?.password) {
      return json(PASSWORD_ERROR);
    }
    await db.user.update({
      where: {
        id,
      },
      data: {
        password: md5(newPassword as string),
      },
    });
    return json({
      success: true,
    } as SUCCESS);
  } catch (error) {
    return json(DB_ERROR);
  }
};

export default function EditPassword() {
  const actionData: ERROR & SUCCESS | undefined = useActionData();
  console.log('action', actionData);
  const transition = useTransition();
  useEffect(() => {
    if (actionData?.msg) {
      message.error(actionData.msg);
    } else if (actionData?.success) {
      message.success('修改成功');
    }
  }, [actionData]);
  return (
    <>
      <Form method='post'>
        <Space direction='vertical'>
          <div className="form-item">
            <Space>
              <label htmlFor='old'>旧密码: </label>
              <Input.Password id='old' placeholder='请输入旧密码' name='oldPassword' />
            </Space>
          </div>
          <div className="form-item">
            <Space>
              <label htmlFor='new'>新密码: </label>
              <Input.Password id='new' placeholder='请输入新密码' name='newPassword' />
              <Button loading={transition.state !== 'idle'} type="primary" htmlType='submit'>修改</Button>
            </Space>
          </div>
        </Space>
      </Form>
    </>
  );
}


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
