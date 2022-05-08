## 带货主播与货物配对平台

### 功能：

### 技术栈：

- 全栈框架：Remix
- UI设计：antd（TDesign不支持服务端渲染，需要用到window变量)
- ORM：prisma

## 环境要求
Node.js: v16及其以上
MySQL：v5及其以上

按照.env_example创建.env文件，用于连接DB
按照cloudConfig_example.json创建cloudConfig.json文件，用于调用腾讯云直播、短信、COS存储桶服务


直播间使用腾讯云的实时音视频的含UI集成方案: [ TUIPlayer&TUIPusher ](https://cloud.tencent.com/document/product/647/63830)、[ Github地址 ](https://github.com/tencentyun/TUILiveRoom/tree/main/Web)

### 开发：
```
// 初始化DB表结构
npm run update:db

// 初始化DB数据
npm run init:db

// 开发模式
npm run dev //(终端1)
npm run dev:css //(终端2)
npm run start:dev //(终端3)
// or pm2 start npm --name Allen -- run start:dev

// 生产模式
npm run build:css //(终端1)
npm run build //(终端2)
npm run start // (终端3)
// or pm2 start npm --name Allen -- run start

// 访问3000端口即可
```
