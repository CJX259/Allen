import React from 'react';
import { ActionFunction, json, LoaderFunction } from 'remix';
import TagManagerComp from '~/components/tagManager';
import { DB_ERROR, PARAMS_ERROR } from '~/error';
import { createTag, deleteTag, updateTag } from '~/server/tag';
import { SUCCESS, TagManagerLoader } from '~/types';
import { db } from '~/utils/db.server';
import { needLogined } from '~/utils/loginUtils';

export const loader: LoaderFunction = async ({request}) => {
  const redirect = await needLogined(request, ['ADMIN']);
  if (redirect) {
    return redirect;
  }
  // 先直接拉全量，调试页面
  const tags = await db.tag.findMany();
  const keyTags = tags.map((item) => {
    return {
      ...item,
      key: item.id.toString(),
    };
  });
  return json({
    data: keyTags,
  } as TagManagerLoader);
  return null;
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
      }
      case 'PUT': {
        // 新增，需要name
        if (!name) {
          return json(PARAMS_ERROR);
        }
        res = await handleCreate({ name: name?.toString() });
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
