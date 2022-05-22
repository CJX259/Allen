import moment from 'moment';
import * as tencentcloud from 'tencentcloud-sdk-nodejs';
import { CloudeServerRes } from '~/types/cloudeServer';
import cloudConfig from '../../cloudConfig.json';

interface BaseParams{
  SdkAppId: number;
}

interface DestoryParams extends BaseParams{
  RoomId: number;
};

interface CheckParams{
  RoomId?: string;
  StartTime: number;
  EndTime: number;
  SdkAppId: string;
}

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

// 查询房间记录
export async function checkRoom(RoomId: number): Promise<boolean> {
  const params: CheckParams = {
    SdkAppId: clientParams.SdkAppId.toString(),
    RoomId: RoomId.toString(),
    StartTime: Math.floor(moment().subtract(6, 'hour').valueOf() / 1000),
    EndTime: Math.floor(moment().valueOf() / 1000),
  };
  try {
    // eslint-disable-next-line new-cap
    const res = await client.DescribeRoomInformation(params);
    if (res.Total !== 0) {
      return res.RoomList[0]?.IsFinished;
    } else {
      // 没有开播记录，即与已结束一样展示
      return true;
    }
  } catch (error: any) {
    console.log('error', error.message);
    return true;
  }
};
