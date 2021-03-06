import md5 from 'md5';
import React from 'react';
import { ActionFunction, json, LinksFunction, LoaderFunction } from 'remix';
import InfoIndex from '~/components/info/index';
import { LoginKey, updateUserKeys, userUnRequireKeys } from '~/const';
import { DB_ERROR, PARAMS_ERROR } from '~/error';
import { getUserComment } from '~/server/comment';
import { getAllTags, userConnectTag } from '~/server/tag';
import { searchUserById } from '~/server/user';
import { getSession } from '~/sessions';
import { InfoLoaderData, LiveDataItem } from '~/types';
import { db } from '~/utils/db.server';
import { getFromDatas, validateFormDatas } from '~/utils/server.index';
import styles from '~/styles/css/info.css';
import { getLiveData } from '~/server/order';
import { checkRoom } from '~/utils/liveRoomManager';

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: styles }];
};

// 处理查询页的搜索请求，返回数据列表
export const loader: LoaderFunction = async ({ request, params }) => {
  const hostname = new URL(request.url).hostname;
  const session = await getSession(request.headers.get('Cookie'));
  // const { id, role } = session.get(LoginKey) || {};
  const userId = params.userId;
  const reg = /^\d+$/;
  if (!userId || !reg.test(userId)) {
    return json(PARAMS_ERROR);
  }
  // 获取用户
  const user = await searchUserById(+userId);
  // 获取登录用户
  const loginInfo = session.get(LoginKey);
  let loginUser;
  if (loginInfo) {
    loginUser = await searchUserById(loginInfo.id);
  }
  // 获取标签信息(全量是为了修改用)
  const allTags = await getAllTags();
  // 获取评论数据
  const { avgRating, comments } = await getUserComment(+userId);
  // 获取直播数据
  const liveData = await getLiveData(+userId);
  // 查看是否在线
  const onLineCache = {} as { [key: string]: any };
  // 拼接了是否在线的直播数据
  const newLiveData: LiveDataItem[] = [];
  for (let i = 0; i < liveData.length; i++) {
    const item = liveData[i];
    if (onLineCache[item.anchorId]) {
      return;
    }
    const isFinished = await checkRoom(item.anchorId);
    newLiveData.push({
      ...item,
      isFinished,
    });
  }
  return {
    user,
    loginUser: loginUser || {},
    allTags,
    commentData: {
      comments,
      avgRating,
    },
    liveData: newLiveData,
    dev: hostname === '127.0.0.1',
  } as InfoLoaderData;
};

// 更新用户数据
export const action: ActionFunction = async ({ request }) => {
  const rawFormData = await request.formData();
  const requiredKeys = updateUserKeys.filter((key) => userUnRequireKeys.indexOf(key) === -1);
  // 全拿出来，可能会有null
  const formDatas = getFromDatas(updateUserKeys, rawFormData);
  // 是否传了必传的参数
  if (!validateFormDatas(requiredKeys, formDatas)) {
    return json(PARAMS_ERROR);
  }
  handleFormat(formDatas);
  const id = +formDatas.id;
  const newFormatData = {...formDatas};
  delete newFormatData.id;
  try {
    // 解析tags,处理user与tag的映射表
    const tags = newFormatData.tags?.split(',')?.map((item: string) => +item) || [];
    await userConnectTag(id, tags);
    delete newFormatData.tags;
    console.log('newformatData', newFormatData);
    // 更新数据
    const updateUser = await db.user.update({
      where: {
        id,
      },
      data: {
        ...newFormatData,
      },
      select: {
        id: true,
      },
    });
    return updateUser;
  } catch (error: any) {
    console.error(error);
    return json(DB_ERROR);
  }
};

// 对数据做些处理
function handleFormat(formDatas: any) {
  // 如果传了密码，则进行md5加密
  if (formDatas.password) {
    formDatas.password = md5(formDatas.password);
  }
  // 如果传了价格，则转为数字
  const reg = /^\d+$/;
  if (formDatas.price && reg.test(formDatas.price)) {
    formDatas.price = +formDatas.price;
  }
}

export default function UserInfo() {
  return <InfoIndex />;
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
