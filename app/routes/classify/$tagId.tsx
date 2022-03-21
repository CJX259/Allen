import { Pagination, Spin } from 'antd';
import React from 'react';
import { ActionFunction, SubmitFunction, useLoaderData, useSubmit, useTransition } from 'remix';
import UserCardItem from '~/components/UserCardItem';
import { USER_PAGESIZE } from '~/const';
import { searchUserByTag } from '~/server/user';
import { ClassifyLoaderData } from '~/types';

// 处理查询页的搜索请求，返回数据列表
export const loader: ActionFunction = async ({ request, params }) => {
  const searchParams = new URL(request.url).searchParams;
  const tagIdParams = params.tagId;
  // const tagIdParams = searchParams.get('tagId');
  const tagId = tagIdParams ? +tagIdParams : null;
  const page = +(searchParams.get('page') || 1);
  const pageSize = +(searchParams.get('pageSize') || USER_PAGESIZE);
  const res: ClassifyLoaderData = {
    tagId,
    data: null,
    total: 0,
    page,
    pageSize: USER_PAGESIZE,
    tag: null,
  };
  if (!tagId) {
    return res;
  }
  const { data, total, tag } = await searchUserByTag(tagId, page, pageSize);
  console.log('data', data, total);
  res.data = data;
  res.total = total;
  res.tag = tag;
  return res;
};

export default function ClassifyComp() {
  const loaderData: ClassifyLoaderData = useLoaderData();
  const { data, total, page, tag } = loaderData;
  const transition = useTransition();
  const submit = useSubmit();
  console.log('classifydata', data);
  return (
    <Spin spinning={transition.state !== 'idle'}>
      <div className='show-title'>{tag?.name}用户</div>
      <div className="show-content">
        {data?.map((item: any) => <UserCardItem key={item.id} data={item} />)}
      </div>
      {!data?.length ?
        <h2>暂无数据</h2> :
        <Pagination
          current={page}
          total={total || 0}
          onChange={(page) => sendSearch(submit, page)}
          pageSize={USER_PAGESIZE}
        />
      }
    </Spin>
  );
};


/**
 * 发起翻页请求
 *
 * @param {*} submit
 * @param {*} page
 */
async function sendSearch(submit: SubmitFunction, page: number) {
  // 重置分页器
  const params = {
  } as any;
  if (page) {
    params.page = page;
  };
  submit(params, {
    method: 'get',
  });
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
