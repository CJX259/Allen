import { useEffect, useLayoutEffect } from 'react';

// 获取指定位数的随机数
export function getRandom(num: number) {
  return Math.floor((Math.random()+Math.floor(Math.random()*9+1))*Math.pow(10, num - 1));
};

// 判断是否浏览器环境
export function isBrowser() {
  return !!(typeof window !== 'undefined' && window.document && window.document.createElement);
}

// 判断是使用layout还是不同的effect
const useIsomorphicLayoutEffect = isBrowser() ? useLayoutEffect : useEffect;
export default useIsomorphicLayoutEffect;

// 对象数组去重
export function deduplication(key: string, data: any[]): any[] {
  return data.filter((item, index) => {
    const findIndex = data.findIndex((v, i) => {
      return item[key] === v[key];
    });
    // 找到的index与当前index相同，说明是第一次出现，可以返回
    // 若不同，则不是第一次出现了，筛选掉
    return findIndex === index;
  });
};

export function renderPlayerUrl(data: {
  secretKey: string;
  sdkAppId: string;
  expireTime: string;
  // 主播id
  anchorId: number;
  // 主播name
  anchorName: string;
  // 当前用户
  userId: number | null | undefined;
  userName: string | null | undefined;
  playerDomain: string;
  dev: boolean;
}) {
  const random = getRandom(4);
  const { secretKey, sdkAppId, expireTime, anchorId, anchorName, userId, userName, dev, playerDomain } = data;
  return `/player/index.html?expireTime=${expireTime}&roomId=${anchorId}&roomName=${anchorName}的直播间&anchorId=${anchorId}&userId=${userId || random}&userName=${userName || ('游客' + random)}&playerDomain=${dev ? 'http://127.0.0.1' : playerDomain}&secretKey=${secretKey}&sdkAppId=${sdkAppId}`;
};

// 简单求交集（不支持对象）
export function findUnion(a: any[], b: any[]) {
  const a1 = new Set(a);
  const a2 = new Set(b);
  return [...a1].filter((item) => a2.has(item));
};

// 简单求并集（不支持对象）
export function findIntersection(a: any[], b: any[]) {
  return [...new Set([...a, ...b])];
};
