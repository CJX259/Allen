import * as tencentcloud from 'tencentcloud-sdk-nodejs';
import { CloudeServerRes } from '~/types/cloudeServer';
import cloudConfig from '../../cloudConfig.json';

interface BaseParams{
  SdkAppId: number;
}

interface DestoryParams extends BaseParams{
  RoomId: number;
};

const TrtcClient = tencentcloud.trtc.v20190722.Client;

const clientConfig = {
  credential: {
    secretId: cloudConfig.SecretId,
    secretKey: cloudConfig.SecretKey,
  },
  region: 'ap-guangzhou',
  profile: {
    httpProfile: {
      endpoint: 'trtc.tencentcloudapi.com',
    },
  },
};

const client = new TrtcClient(clientConfig);
const clientParams: BaseParams = {
  'SdkAppId': 1400509104,
};

// 销毁房间
export async function destoryRoom(RoomId: number):Promise<CloudeServerRes> {
  const params: DestoryParams = {
    ...clientParams,
    RoomId,
  };
  try {
    // eslint-disable-next-line new-cap
    const res = await client.DismissRoom(params);
    console.log('res', res);
    return {
      success: true,
      data: res,
    };
  } catch (error: any) {
    console.log('error', error.message);
    return {
      success: false,
      msg: error.message,
    };
  }
};
