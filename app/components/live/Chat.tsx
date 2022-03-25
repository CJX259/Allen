import React, { useLayoutEffect } from 'react';
import TIM from 'tim-js-sdk';

export default function Chat() {
  useLayoutEffect(() => {
    initSdk();
  }, []);
  return (
    <div className='chat-wrapper'>Chat</div>
  );
}


async function initSdk() {
  // 创建 SDK 实例，TIM.create() 方法对于同一个 SDKAppID 只会返回同一份实例
  const options = {
    SDKAppID: 1400509104, // 接入时需要将0替换为您的即时通信应用的 SDKAppID
  };
  const tim = TIM.create(options); // SDK 实例通常用 tim 表示
  // 设置 SDK 日志输出级别，详细分级请参考 setLogLevel 接口的说明
  tim.on(TIM.EVENT.MESSAGE_RECEIVED, function(event: any) {
    // 收到推送的单聊、群聊、群提示、群系统通知的新消息，可通过遍历 event.data 获取消息列表数据并渲染到页面
    // event.name - TIM.EVENT.MESSAGE_RECEIVED
    // event.data - 存储 Message 对象的数组 - [Message]
    const length = event.data.length;
    let message;
    for (let i = 0; i < length; i++) {
      // Message 实例的详细数据结构请参考 Message
      // 其中 type 和 payload 属性需要重点关注
      // 从v2.6.0起，AVChatRoom 内的群聊消息，进群退群等群提示消息，增加了 nick（昵称） 和 avatar（头像URL） 属性，便于接入侧做体验更好的展示
      // 前提您需要先调用 updateMyProfile 设置自己的 nick（昵称） 和 avatar（头像 URL），请参考 updateMyProfile 接口的说明
      message = event.data[i];
      switch (message.type) {
        case TIM.TYPES.MSG_TEXT:
          // 收到了文本消息
          _handleTextMsg(message);
          break;
        case TIM.TYPES.MSG_CUSTOM:
          // 收到了自定义消息
          _handleCustomMsg(message);
          break;
        case TIM.TYPES.MSG_GRP_TIP:
          // 收到了群提示消息，如成员进群、群成员退群
          _handleGroupTip(message);
          break
        case TIM.TYPES.MSG_GRP_SYS_NOTICE:
          // 收到了群系统通知，通过 REST API 在群组中发送的系统通知请参考 在群组中发送系统通知 API
          _handleGroupSystemNotice(message);
          break;
        default:
          break;
      }
      console.log('message', message);
    }
  });

  function _handleTextMsg(message: any) {
    // 详细数据结构请参考 TextPayload 接口的说明
    console.log(message.payload.text); // 文本消息内容
  }

  function _handleCustomMsg(message: any) {
    // 详细数据结构请参考 CustomPayload 接口的说明
    console.log(message.payload);
  }

  function _handleGroupTip(message: any) {
    // 详细数据结构请参考 GroupTipPayload 接口的说明
    switch (message.payload.operationType) {
      case TIM.TYPES.GRP_TIP_MBR_JOIN: // 有成员加群
        break;
      case TIM.TYPES.GRP_TIP_MBR_QUIT: // 有群成员退群
        break;
      case TIM.TYPES.GRP_TIP_MBR_KICKED_OUT: // 有群成员被踢出群
        break;
      case TIM.TYPES.GRP_TIP_MBR_SET_ADMIN: // 有群成员被设为管理员
        break;
      case TIM.TYPES.GRP_TIP_MBR_CANCELED_ADMIN: // 有群成员被撤销管理员
        break;
      case TIM.TYPES.GRP_TIP_GRP_PROFILE_UPDATED: // 群组资料变更
        break;
      case TIM.TYPES.GRP_TIP_MBR_PROFILE_UPDATED: // 群成员资料变更，例如群成员被禁言
        break;
      default:
        break;
    }
  }

  function _handleGroupSystemNotice(message: any) {
    console.log(message.payload.userDefinedField); // 用户自定义字段。使用 RESTAPI 发送群系统通知时，可在该属性值中拿到自定义通知的内容。
  }
  await login(tim);
};

async function login(tim: any) {
  const imResponse = await tim.login({ userID: 'jessy', userSig: 'eJyrVgrxCdYrSy1SslIy0jNQ0gHzM1NS80oy0zLBwlmpxcWVUInilOzEgoLMFCUrQxMDA1MDS0MDE4hMSWZuKlDUzMTC0MLcxNIYIppaUZBZBBI3NTU1MgABqDmZ6UCTfd0Cw8JDA1O0jdyLXL2yS4OdHItMk8ONvdy9ytND3Z3zcjI8g1KDK53dA22VagF3VzGd' });
  console.log('login success', imResponse.data); // 登录成功
  updateInfo(tim);
};

async function updateInfo(tim: any) {
  const imResponse = await tim.updateMyProfile({
    nick: '我的昵称',
    avatar: 'https://cn.bing.com/images/search?q=%E5%9B%BE%E7%89%87&FORM=IQFRBA&id=8807124F703F1F50A83BC9CEE79AAEF12802C332',
  });
  console.log(imResponse.data); // 更新资料成功
}

async function sendMessage(tim: any) {
  // 1. 创建消息实例，接口返回的实例可以上屏
  const message = tim.createTextMessage({
    to: 'user1',
    conversationType: TIM.TYPES.CONV_C2C,
    // 消息优先级，用于群聊（v2.4.2起支持）。如果某个群的消息超过了频率限制，后台会优先下发高优先级的消息，详细请参考：https://cloud.tencent.com/document/product/269/3663#.E6.B6.88.E6.81.AF.E4.BC.98.E5.85.88.E7.BA.A7.E4.B8.8E.E9.A2.91.E7.8E.87.E6.8E.A7.E5.88.B6)
    // 支持的枚举值：TIM.TYPES.MSG_PRIORITY_HIGH, TIM.TYPES.MSG_PRIORITY_NORMAL（默认）, TIM.TYPES.MSG_PRIORITY_LOW, TIM.TYPES.MSG_PRIORITY_LOWEST
    // priority: TIM.TYPES.MSG_PRIORITY_NORMAL,
    payload: {
      text: 'Hello world!',
    },
    // 消息自定义数据（云端保存，会发送到对端，程序卸载重装后还能拉取到，v2.10.2起支持）
    // cloudCustomData: 'your cloud custom data'
  });
  // 2. 发送消息
  const promise = tim.sendMessage(message);
  promise.then(function(imResponse: any) {
    // 发送成功
    console.log(imResponse);
  }).catch(function(imError: any) {
    // 发送失败
    console.warn('sendMessage error:', imError);
  });
};
