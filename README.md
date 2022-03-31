## 带货主播与货物配对平台

### 功能：

### 技术栈：

- 全栈框架：Remix
- UI设计：antd（TDesign不支持服务端渲染，需要用到window变量)
- ORM：prisma

### 开发：
```
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
