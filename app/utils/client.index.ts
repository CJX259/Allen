
import config from '~/../cloudConfig.json';
import Cos from 'cos-js-sdk-v5';
import { message } from 'antd';

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


/**
 * 校验user中是否已存在重复值
 *
 * @param {string} key
 * @param {*} value
 * @param {string} msg
 * @return {*} Promise<any>
 */
export async function validateRepeat(key: string, value: any, msg: string) {
  if (!value) {
    return Promise.resolve();
  }
  // 调接口，查下数据库有无重复数据
  const res = await (await fetch(`/queryUser?_data=routes/queryUser&key=${key}&value=${value}`, {
    method: 'GET',
  })).json();
  if (res) {
    throw new Error(msg);
  }
  return Promise.resolve();
};

/**
 * 传入文件名与文件数据（或blob形式），上传至COS
 *
 * @param {string} filename
 * @param {*} file
 */
export function uploadImage(filename: string, file: any) {
  const cos = new Cos({
    SecretId: config.SecretId,
    SecretKey: config.SecretKey,
  });
  cos.putObject({
    Bucket: 'sls-cloudfunction-ap-guangzhou-code-1301421790', /* 必须 */
    Region: 'ap-guangzhou', /* 存储桶所在地域，必须字段 */
    Key: config.prefix + filename, /* 必须 */
    StorageClass: 'STANDARD',
    Body: file, // 上传文件对象
    onProgress: function(progressData) {
      console.log(JSON.stringify(progressData));
    },
  }, function(err, data) {
    if (err) {
      message.error('上传云端失败');
    } else {
      message.success('上传云端成功');
    }
  });
};
