import { LoaderFunction } from 'remix';
import { db } from '~/utils/db.server';

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
