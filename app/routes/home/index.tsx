import {
  LoaderFunction,
  ActionFunction,
  json,
} from 'remix';
import React from 'react';
import HomeComp from '../../components/home';
import { Order, Role, User } from '@prisma/client';
import { calcOrderCount, getOrderOrderByTime } from '~/server/order';
import { deduplication } from '~/utils';
import { calcAvgRating } from '~/server/comment';
import { getSessionUserData } from '~/utils/loginUtils';
import { searchUserById } from '~/server/user';
import { HomeLoaderData } from '~/types';
import { checkRoom } from '~/utils/liveRoomManager';

export const loader: LoaderFunction = async ({ request }) => {
  const sessionUser = await getSessionUserData(request);
  let curUser;
  if (sessionUser?.id) {
    curUser = await searchUserById(sessionUser.id);
  }
  // 展示直播间排表，只选出未开始，或者开播时间在6小时前的记录
  // 有时间限制了，全量拿即可，拿出来再对传出去的用户去重

  const orders = await getOrderOrderByTime();
  // console.log('order', orders);
  // 对每个order，拿出主播信息，然后对主播信息进行去重处理
  const anchors = orderToUser(orders);
  // 数组去重处理
  const dedupAnchors = deduplication('id', anchors);
  const onLineAnchors = [];
  // 放到for循环内
  for (let i = 0; i < dedupAnchors.length; i++) {
    const item = dedupAnchors[i];
    // 是否在播
    const isFinished = await checkRoom(item.id);
    // 不在播的直接删掉
    if (isFinished) {
      continue;
    }
    // 拿平均评分和总签约数
    const orderCount = await calcOrderCount(item.id);
    // 该用户的平均评分
    const avgRating = await calcAvgRating(item.id);
    onLineAnchors.push({
      ...dedupAnchors[i],
      orderCount,
      avgRating,
    });
  };
  return json({
    data: onLineAnchors,
    curUser,
  } as HomeLoaderData);
};

export const action: ActionFunction = async ({ request }) => {
  return null;
};

function orderToUser(orders: (Order & { target: User; author: User; })[]) {
  return orders.map((item) => {
    const time = item.time;
    let key: 'author' | 'target' = 'author';
    if (item.author.role === Role.ANCHOR) {
      key = 'author';
    } else {
      key = 'target';
    }
    return {
      ...item[key],
      time,
    };
  });
}


export default function HomePageCmp() {
  return (
    <HomeComp />
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
