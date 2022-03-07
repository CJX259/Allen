import { LoaderFunction, useLoaderData, useTransition } from 'remix';
import React from 'react';
import ClassifyCard from '~/components/classify/classifyCard';
import { getAllTags } from '~/server/tag';
import { Spin } from 'antd';

export const loader: LoaderFunction = async ({ request }) => {
  // 查询所有标签
  return getAllTags();
};

export default function ClassifyPage() {
  const tagsData: { name: string; id: number; }[] = useLoaderData();
  const transition = useTransition();
  return (
    <Spin spinning={transition.state !== 'idle'}>
      <div className='classify-wrapper'>
        {tagsData?.map((item) => {
          return <ClassifyCard key={item.id} data={item} />;
        })}
      </div>
    </Spin>
  );
};


export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return (
    <div>
      <h1>500</h1>
      <h2>服务器出错</h2>
      <h3>{error.message}</h3>
    </div>
  );
};
