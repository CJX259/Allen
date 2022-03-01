import React from 'react';
import { ActionFunction } from 'remix';
import SearchComp from '~/components/search';
import { db } from '~/utils/db.server';

export const loader: ActionFunction = async ({ request, params }) => {
  const role = params.role;
  const searchParams = new URL(request.url).searchParams;
  const key = searchParams.get('key');
  const page = +(searchParams.get('page') || 1);
  const limit = +(searchParams.get('limit') || 2);
  // 是审核页的查询就传isAudit = true
  const isAudit = !!searchParams.get('isAudit') || false;
  let res = null;
  switch (role) {
    case 'user': {
      res = await searchUser(key, page, limit, isAudit);
      console.log('res', res);
      break;
    }
    case 'goods': {
      break;
    }
  }
  return res;
};

export default function SearchType() {
  return <SearchComp />;
};


/**
 * key可以为id或name，id精确匹配，name模糊匹配，订单表的信息也返回
 *
 * @param {*} key
 * @param {number} page
 * @param {number} limit
 * @param {boolean} isAudit
 * @return {*} user
 */
async function searchUser(key: any, page: number, limit: number, isAudit: boolean ) {
  // 后续需要外接订单表
  if (!key) {
    // 无key搜索,只看页码
    return db.user.findMany({
      take: limit,
      skip: (page - 1) * limit,
    });
  }
  let resUser;
  const numberReg = /^\d+$/;
  if (numberReg.test(key)) {
    resUser = await db.user.findUnique({
      where: {
        id: +key,
      },
      select: {
        id: true,
        name: true,
      },
    });
    if (resUser) {
      return resUser;
    }
  }
  return db.user.findMany({
    where: {
      name: {
        contains: key,
      },
    },
    orderBy: {
      name: 'asc',
    },
    take: limit,
    skip: (page - 1) * limit,
  });
};
