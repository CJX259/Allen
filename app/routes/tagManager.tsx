import React from 'react';
import { ActionFunction, json, LoaderFunction } from 'remix';
import TagManagerComp from '~/components/tagManager';
import { DB_ERROR, PARAMS_ERROR } from '~/error';
import { updateTag } from '~/server/tag';
import { TagManagerLoader } from '~/types';
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
  const formData = await request.formData();
  const id = formData.get('id');
  const name = formData.get('name');
  console.log('id, name', id, name);
  const reg = /^\d+$/;
  if (id === null || name === null || !reg.test(id as string)) {
    return json(PARAMS_ERROR);
  }
  const method = request.method;
  try {
    switch (method) {
      case 'POST': {
        await updateTag(+id, name as string);
        break;
      }
      default:
        break;
    }
    await new Promise((res) => {
      setTimeout(() => {
        res(1);
      }, 1000);
    });
    return json({ success: true });
  } catch (error) {
    return json(DB_ERROR);
  }
};

export default function TagManager() {
  return <TagManagerComp />;
};
