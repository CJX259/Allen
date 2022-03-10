
import config from '~/../cloudConfig.json';
import Cos from 'cos-js-sdk-v5';
import { message } from 'antd';
import { Order, OrderStatus, Role } from '@prisma/client';
import { SubmitFunction } from 'remix';
import { SessionUserData } from '~/types';

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

// 发起签约请求
export function sendOrder(id: number, role: Role, submit: SubmitFunction) {
  submit({
    targetId: '' + id,
    targetRole: role,
  }, {
    method: 'post',
    action: '/order',
  });
};

// 计算当角色的签约状态是否为pendding
export function isPendding(curUser: SessionUserData, orderInfo: Order) {
  const { authorId, targetId, authorNext, targetNext, status } = orderInfo;
  // 是否为等待中，发起人就看发起人有没有同意，发起人同意了说明在等待接收人同意。接收人同理
  let pendding = isAuthor(curUser.id, authorId, targetId) ? !!authorNext : !!targetNext;
  // 都没同意则也可以通过
  if (pendding && !targetNext && !authorNext) {
    pendding = false;
  }
  // 以上基础上，还要对不同流程下角色进行限制
  // 检验中时，要等供应商点下一步后，主播才能开始点
  // 化为判断式就是，角色为主播且两边都没点next(懒得判断供应商是target还是author了)
  if (status === OrderStatus.CHECKING && curUser.role === Role.ANCHOR && !targetNext && !authorNext) {
    return true;
  }
  // 完成中时，要等主播点下一步提交信息后，供应商才能开始点
  // 化为判断式就是，角色为供应商且两边都没点next
  if (status === OrderStatus.DOING && curUser.role === Role.COMPANY && !targetNext && !authorNext) {
    return true;
  }
  // 不满足上面两个特殊情况，就按照原来的判断
  return pendding;
};

/**
 * 判断当前角色是否为发起者（默认为发起者与接受者之间）
 *
 * @export
 * @param {number} curUserId
 * @param {number} authorId
 * @param {number} targetId
 * @return {*}
 */
export function isAuthor(curUserId: number, authorId: number, targetId: number) {
  return curUserId === authorId ? true : false;
};
