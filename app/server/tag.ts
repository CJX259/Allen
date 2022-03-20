import { db } from '~/utils/db.server';

/**
 * 更新单个tag
 *
 * @export
 * @param {number} id
 * @param {string} name
 * @return {*}
 */
export async function updateTag(id: number, name: string) {
  return db.tag.update({
    where: {
      id,
    },
    data: {
      name,
    },
  });
}

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


/**
 * 给用户贴标签,先查出该用户的所有标签（all）去掉公共部分，all剩下的就是被删的，ids剩下的就是新增的
 *
 * @export
 * @param {number} userId
 * @param {number[]} tagIds
 */
export async function userConnectTag(userId: number, tagIds: number[]) {
  // 找出该用户所有Tag
  const allTagsOnUser = await db.tagsOnUsers.findMany({
    where: {
      userId,
    },
    select: {
      tagId: true,
    },
  });
  // 两数组交集
  const map = allTagsOnUser.map((item) => item.tagId).filter((item: number) => tagIds.indexOf(item) !== -1);
  // all数组删除map里的元素，即删除的标签
  const deleteTags = findDifferencesSet(allTagsOnUser.map((item) => item.tagId), map);
  const delRes = await delTagsOnUser(userId, deleteTags);

  // 新增的标签
  const createTags = findDifferencesSet(tagIds, map);
  const createRes = await createTagsOnUser(userId, createTags);
  console.log('标签更新 create del', createRes, delRes);
};

// 找出差集
function findDifferencesSet(findArr: number[], map: number[]) {
  const res = [] as number[];
  findArr.forEach((ele) => {
    // map不存在，则是delete的元素
    if (map.indexOf(ele) === -1) {
      res.push(ele);
    }
  });
  return res;
};


/**
 * 批量新建某些用户的标签（map表）
 *
 * @param {number} userId
 * @param {number[]} tagIds
 * @return {*}
 */
async function createTagsOnUser(userId: number, tagIds: number[]) {
  const datas = [] as any[];
  tagIds.forEach((item) => {
    datas.push({
      userId,
      tagId: item,
    });
  });
  return db.tagsOnUsers.createMany({
    data: datas,
  });
};


/**
 * 批量删除某用户的某些标签（删除map表）
 *
 * @param {number} userId
 * @param {number[]} tagIds
 * @return {*}
 */
async function delTagsOnUser(userId: number, tagIds: number[]) {
  const proms = [] as Promise<any>[];
  tagIds.forEach((item) => {
    proms.push(db.tagsOnUsers.delete({
      where: {
        tagId_userId: {
          tagId: item,
          userId,
        },
      },
    }));
  });
  return Promise.all(proms);
};
