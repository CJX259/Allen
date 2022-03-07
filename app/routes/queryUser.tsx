import { ActionFunction, LoaderFunction } from 'remix';
import { LoginKey } from '~/const';
import { getSession } from '~/sessions';
import { SessionUserData } from '~/types';
import { db } from '~/utils/db.server';

// 用于传递一个属性值，查看有无已存在该属性的用户(若有登录session，则对比下是否为用户自身)
export const loader: LoaderFunction = async ({ request }) => {
  const cookie = request.headers.get('Cookie');
  const session = await getSession(cookie);
  const { id }: SessionUserData = session.get(LoginKey) || {};
  const url = new URL(request.url);
  const params = url.searchParams;
  const key: string = params.get('key') || '';
  const value = params.get('value');
  // 校验不存在则报错
  const repeatUser = await db.user.findFirst({
    where: {
      [key]: value,
    },
    select: {
      id: true,
    },
  });
  // 若为同一用户，则不算
  if (repeatUser?.id === id) {
    return null;
  }
  return repeatUser || null;
};

export const action: ActionFunction = async ({request}) => {
  return null;
};
