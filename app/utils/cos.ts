import Cos from 'cos-js-sdk-v5';
import config from '~/../cloudConfig.json';

let cos: Cos;

/**
 * 单例模式
 *
 * @export
 * @return {*}
 */
export function getCos() {
  if (cos) {
    return cos;
  } else {
    cos = new Cos({
      SecretId: config.SecretId,
      SecretKey: config.SecretKey,
    });
    return cos;
  }
}

/**
 * 通过图片key，获取图片url，直接给img渲染
 *
 * @export
 * @param {string} key
 * @param {Function} callback
 */
export function getImgUrl(key: string, callback: Function) {
  const cos = getCos();
  cos.getObjectUrl({
    Bucket: 'sls-cloudfunction-ap-guangzhou-code-1301421790',
    Region: 'ap-guangzhou',
    Key: config.prefix + key,
  }, function(err, data) {
    if (err) {
      console.log(err);
      return;
    }
    callback(data);
  });
}
