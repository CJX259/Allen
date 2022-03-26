import { ORDER_EXPRESS_PARAMS, ORDER_LIVE_INFO } from '~/const';
import { OrderOpts } from '~/types';

/**
 * 处理formData，返回一个统一对象
 *
 * @export
 * @param {string[]} keys
 * @param {FormData} formData
 * @return {*}  {{ [key: string]: any }}
 */
export function getFromDatas(keys: string[], formData: FormData) {
  return keys.reduce((prev: any, cur: string) => {
    const data = formData.get(cur);
    prev[cur] = data;
    return prev;
  }, {});
};

/**
 * 校验data中有无必须的属性
 *
 * @export
 * @param {string[]} validateKeys
 * @param {object} data
 * @return {*} boolean
 */
export function validateFormDatas(validateKeys: string[], data: { [key: string]: any }) {
  try {
    validateKeys.forEach((key) => {
      if (!data[key] && data[key] !== false && data[key] !== undefined && data[key] !== '' && data[key] !== 0) {
        throw new Error();
      }
    });
    return true;
  } catch (error) {
    return false;
  };
}


/**
 * 将字符undefined与null转化为空字符，避免在http传输过程中造成问题
 *
 * @export
 * @param {*} value
 * @return {*}
 */
export function transformNullAndUndefined(value: any) {
  if (value === 'undefined' || value === 'null') {
    return '';
  }
  return value;
};

export function formatOpts(opts: OrderOpts) {
  const orderKeys = [
    ORDER_EXPRESS_PARAMS.expressNum,
    ORDER_EXPRESS_PARAMS.expressType,
    ORDER_EXPRESS_PARAMS.tips,
    // ORDER_LIVE_INFO.liveUrl,
    ORDER_LIVE_INFO.time,
  ];
  return Object.keys(opts).reduce((prev, cur) => {
    if (orderKeys.indexOf(cur) !== -1) {
      prev[cur] = opts[cur];
    };
    return prev;
  }, {} as { [key: string]: any});
};
