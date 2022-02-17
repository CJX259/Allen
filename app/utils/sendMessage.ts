import * as tencentcloud from 'tencentcloud-sdk-nodejs';
import cloudConfig from '../../cloudConfig.json';

interface SendSmsParams {
  SmsSdkAppId: string;
  SignName: string;
  SessionContext?: string;
  TemplateId: string;
  PhoneNumberSet: string[];
  TemplateParamSet: string[];
}

const params: SendSmsParams = {
  /* 短信应用ID: 短信SmsSdkAppId在 [短信控制台] 添加应用后生成的实际SmsSdkAppId，示例如1400006666 */
  SmsSdkAppId: '1400629930',
  SignName: '练习写代码和放笔记个人网',
  /* 用户的 session 内容: 可以携带用户侧 ID 等上下文信息，server 会原样返回 */
  SessionContext: '',
  PhoneNumberSet: [],
  TemplateId: '1300529',
  TemplateParamSet: [],
};

// 导入对应产品模块的client models。
const SmsClient = tencentcloud.sms.v20210111.Client;

/* 实例化要请求产品(以sms为例)的client对象 */
const client = new SmsClient({
  credential: {
    secretId: cloudConfig.SecretId,
    secretKey: cloudConfig.SecretKey,
  },
  region: 'ap-guangzhou',
  profile: {
    /* SDK默认用TC3-HMAC-SHA256进行签名，非必要请不要修改这个字段 */
    signMethod: 'HmacSHA256',
    httpProfile: {
      reqMethod: 'POST',
      reqTimeout: 30,
      endpoint: 'sms.tencentcloudapi.com',
    },
  },
});

/**
 * 发送验证码短信
 *
 * @export
 * @param {string[]} phones
 * @param {string[]} contents
 * @return {*}
 */
export async function sendVerCode(phones: string[], contents: string[]) {
  params.TemplateParamSet = contents;
  params.PhoneNumberSet = phones;
  // 通过client对象调用想要访问的接口，需要传入请求对象以及响应回调函数
  try {
    // eslint-disable-next-line new-cap
    return client.SendSms(params);
  } catch (error) {
    console.log('短信发送出错', error);
  }
}
