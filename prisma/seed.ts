import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();


/**
 * 初始化数据库的数据
 *
 */
async function main() {
  const alice = await db.user.create({
    data: {
      name: 'jessy1',
      email: '1049602251',
      jobTitle: '学生',
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
