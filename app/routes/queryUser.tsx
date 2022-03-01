import { LoaderFunction } from 'remix';
import { db } from '~/utils/db.server';

// 用于传递一个属性值，查看有无已存在该属性的用户
export const loader: LoaderFunction = async ({ request }) => {
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
  return repeatUser || null;
};
