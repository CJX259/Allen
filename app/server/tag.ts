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

// 给用户贴标签
// 先查出该用户的所有标签（all）
// all有，ids没有，为删除
// all没有，ids有，为新增，
// 综合起来看就是，去掉公共部分，all剩下的就是被删的，ids剩下的就是新增的
// 其余不变
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
  console.log('delRes', delRes);

  // 新增的标签
  const createTags = findDifferencesSet(tagIds, map);
  const createRes = await createTagsOnUser(userId, createTags);
  console.log('createRes', createRes);

  const proms = [];
  console.log('userConnectTag', userConnectTag);
  for (let i = 0; i < tagIds.length; i++) {
    const ele = tagIds[i];
    proms.push(await db.tagsOnUsers.upsert({
      where: {
        tagId_userId: {
          tagId: ele,
          userId,
        },
      },
      update: {
        userId,
        tagId: ele,
      },
      create: {
        userId,
        tagId: ele,
      },
    }));
  };
  const res = await Promise.all(proms);
  console.log('更新tag成功', res);
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
