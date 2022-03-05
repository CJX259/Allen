import { User } from '@prisma/client';

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
      if (!data[key]) {
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
