import { LoaderFunction, useLoaderData } from 'remix';
import React from 'react';
import ClassifyCard from '~/components/classify/classifyCard';
import { getAllTags } from '~/server/tag';

export const loader: LoaderFunction = async ({ request }) => {
  // 查询所有标签
  return getAllTags();
};

export default function ClassifyPage() {
  const tagsData: { name: string; id: number; }[] = useLoaderData();
  console.log('tagsData', tagsData);
  return (
    <div className='classify-wrapper'>
      {tagsData?.map((item) => {
        return <ClassifyCard key={item.id} data={item} />;
      })}
    </div>
  );
};
