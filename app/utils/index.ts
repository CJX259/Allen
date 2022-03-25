
// 获取指定位数的随机数
export function getRandom(num: number) {
  return Math.floor((Math.random()+Math.floor(Math.random()*9+1))*Math.pow(10, num - 1));
};
