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
