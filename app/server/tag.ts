import { db } from '~/utils/db.server';


/**
 * 一次获取所有标签，懒得分页了
 *
 * @export
 * @return {*}
 */
export async function getAllTags() {
  return await db.tag.findMany({
    select: {
      name: true,
      id: true,
    },
  });
};
