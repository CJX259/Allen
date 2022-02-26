

/**
 * 删掉为undefined和null的属性
 *
 * @export
 * @param {object} data
 * @return {*}
 */
export function formatFormData(data: { [key: string]: any}) {
  const obj = {} as { [key: string]: any };
  Object.keys(data).map((key) => {
    const ele = data[key];
    if (ele || ele === '' || ele === 0) {
      obj[key] =ele;
    }
  });
  return obj;
};
