import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();


/**
 * 初始化数据库的数据
 *
 */
async function main() {
  const alice = await db.user.create({
    data: {
      name: 'jessy',
      realName: '陈建希',
      idCard: '440902200001230431',
      address: '广东省茂名市茂南区官渡2路248号大院',
      mail: '1049602251@qq.com',
      liveData: 'xxx',
      liveMaxAge: new Date(),
      role: 'ADMIN',
      phone: '19927574193',
      password: '123123',
    },
  });
  console.log({ alice });
}

main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await db.$disconnect();
    });
