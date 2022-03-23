import React from 'react';
import { ActionFunction, json, LinksFunction, LoaderFunction } from 'remix';
import TagManagerComp from '~/components/tagManager';
import { USER_PAGESIZE } from '~/const';
import { DB_ERROR, PARAMS_ERROR } from '~/error';
import { createTag, deleteTag, getTagsByPage, updateTag } from '~/server/tag';
import { SUCCESS, TagManagerLoader } from '~/types';
import { needLogined } from '~/utils/loginUtils';
import styles from '~/styles/css/tagManager.css';

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: styles},
  ];
};

export const loader: LoaderFunction = async ({request}) => {
  const redirect = await needLogined(request, ['ADMIN']);
  if (redirect) {
    return redirect;
  }
  const searchParams = new URL(request.url).searchParams;
  const page = searchParams.get('page') || '1';
  const searchKey = searchParams.get('searchKey') || '';

  // 分页拉标签
  const { data, total } = await getTagsByPage(searchKey, +page, USER_PAGESIZE);
  // 增加key属性
  const keyTags = data.map((item) => {
    return {
      ...item,
      key: item.id.toString(),
    };
  });
  return json({
    data: keyTags,
    page,
    total,
  } as TagManagerLoader);
};

export const action: ActionFunction = async ({ request }) => {
  const redirect = await needLogined(request, ['ADMIN']);
  if (redirect) {
    return redirect;
  };
  const reg = /^\d+$/;
  const formData = await request.formData();
  const id = formData.get('id');
  const name = formData.get('name');

  const method = request.method;
  let res;
  try {
    switch (method) {
      case 'POST': {
        // 修改，需要id与name
        if (id === null || name === null || !reg.test(id as string)) {
          return json(PARAMS_ERROR);
        }
        res = await handleUpdate(+id, name?.toString());
        break;
      }
      case 'DELETE': {
        // 删除，需要id
        if (id === null || !reg.test(id as string)) {
          return json(PARAMS_ERROR);
        }
        res = await handleDelete(+id);
        break;
      }
      case 'PUT': {
        // 新增，需要name
        if (!name) {
          return json(PARAMS_ERROR);
        }
        res = await handleCreate({ name: name?.toString() });
        break;
      }
      default:
        break;
    }
    return json({ success: true, data: res } as SUCCESS);
  } catch (error) {
    return json(DB_ERROR);
  }
};

export default function TagManager() {
  return <TagManagerComp />;
};

async function handleUpdate(id: number, name?: string) {
  await updateTag(+id, name as string);
};

async function handleDelete(id: number) {
  return await deleteTag(id);
};

async function handleCreate(data: { name?: string }) {
  return await createTag(data as { name: string });
};
