## 带货主播与货物配对平台

### 功能：



### 技术栈：

- 全栈框架：Remix
- UI设计：TDesign
- ORM：prisma



#### Prisma

##### 初始化：

```
npm init -y
npm install prisma typescript ts-node @types/node --save-dev
npx prisma init --datasource-provider mysql
```

将会生成`prisma`文件夹以及`.env`配置文件

##### 配置：

`.env`文件中的`DATABASE_URL`设置数据库信息

`数据库类型://USER:PASSWORD@HOST:PORT/DATABASE?schema=TABLE`（大写的为配置信息内容）

##### 使用：

1、通过`schema.prisma`文件生成Prisma Client

使用Prisma Client，先安装@prisma/client

```
npm install @prisma/client
npx prisma generate
```

*`prisma generate`会读取prisma模式并生成一个适合您的模型的prisma Client版本。*

以后每当您对 Prisma 架构进行更改时，您都需要**手动调用`prisma generate`**以适应 Prisma 客户端 API 中的更改。

2、同步模型到数据库

```
npx prisma db push
// 同步成功将在命令行输出以下内容
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": MySQL database "Allen" at "cdb-oqaw3yte.cd.tencentcdb.com:10020"

🚀  Your database is now in sync with your schema. Done in 4.42s

✔ Generated Prisma Client (3.9.1 | library) to ./node_modules/@prisma/client in 96ms
```

`db push`指令在修改表结构时，会报出一些提示信息，如在已有表中增加必填字段时，会阻止你，除非该列有默认值（使用`--accept-data-loss`标志来跳过这个警告，或者使用`--force-reset`来忽略掉所有警告。此外，如果 schema 变化了意味着 seed 脚本将不再有效，可以使用`--skip-seed`标志来跳过 seeding）

3、连接数据库

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // ... you will write your Prisma Client queries here
  const allUsers = await prisma.user.findMany()
  // console.log('prisma', prisma);
  console.log(allUsers)
}

main()
```

*注意：每次数据结构更改都需要执行generate和push*

##### `seed.ts`设置一些初始化数据

在`prisma/`下新建文件`seed.ts`，里面对数据库进行操作

```typescript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const alice = await prisma.user.create({
    data: {
      name: 'jessy',
      email: '1049602251',
      jobTitle: '学生',
    }
  })
  console.log({ alice })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

`package.json`设置运行脚本

```json
	// 根级上
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  },
```

命令行执行`npx prisma db seed`则会执行`seed`文件

#### 事务处理

##### 依赖写入

在以下情况下，写入被认为是相互**依赖**的。

- 操作依赖于前一个操作的结果（例如，数据库生成一个 ID)

最常见的情况是创建一条记录并使用生成的 ID 来创建或更新相关的记录, 比如：

- 创建一个用户和两个相关的博客文章（一对多关系）--在创建博客文章之前必须知道作者 ID

依赖性的写入必须一起成功，以保持数据的一致性，并防止意外的行为，如没有作者的博客文章。

Prisma 对依赖写入的解决方案是**嵌套写法**，通过`create`、 `update`实现。下面的嵌套写法创建一个用户和两个博客文章：

```javascript
const nestedWrite = await prisma.user.create({
  data: {
    email: 'imani@prisma.io',
    posts: {
      create: [
        { title: 'My first day at Prisma' },
        { title: 'How to configure a unique constraint in PostgreSQL' },
      ],
    },
  },
})
```

如果任何操作失败，Prisma 将回滚整个事务。嵌套写法目前不支持顶级的批量操作，如`client.user.deleteMany`和`client.user.updateMany`。
