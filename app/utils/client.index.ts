

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

/**
 * 将图片的数据读取出来，转换为一个url供预览
 *
 * @param {*} img
 * @param {*} callback
 */
export function getBase64(img: any, callback: any) {
  console.log('img', typeof img, img);
  const reader = new FileReader();
  // 绑定事件。读取完后就执行回调，传入图片临时url
  reader.addEventListener('load', () => callback(reader.result));
  // 解析图片，生成临时url
  reader.readAsDataURL(img);
}
