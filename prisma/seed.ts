import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
import md5 from 'md5';

/**
 * 初始化数据库的数据
 *
 */
async function main() {
  await db.tag.create({
    data: {
      name: '零食类',
    },
  });
  const proms = [

    db.user.create({
      data: {
        name: 'jessy',
        realName: '陈建希',
        idCard: '440902200001230431',
        address: '广东省茂名市茂南区官渡2路248号大院',
        mail: '1049602251@qq.com',
        role: 'ADMIN',
        phone: '19927574193',
        vx: 'sxyyasw',
        password: md5('123123'),
      },
    }),
    db.user.create({
      data: {
        name: '旺仔食品',
        realName: '张蒙',
        idCard: '1',
        mail: '1@qq.com',
        address: '广州市番禺区南村镇南村文明路5号311房',
        phone: '19927574190',
        vx: '19927574191',
        role: 'COMPANY',
        password: md5('123123'),
        goods: {
          create: {
            name: '旺仔牛奶',
            introduce: '一瓶旺仔牛奶',
            price: 4,
            // 同时在映射表中创建一个标签记录
            tags: {
              create: [
                {
                  tag: {
                    connect: {
                      name: '零食类',
                    },
                  },
                },
              ],
            },
          },
        },
        tags: {
          create: [
            {
              tag: {
                connect: {
                  name: '零食类',
                },
              },
            },
          ],
        },
      },
    }),
    db.user.create({
      data: {
        name: '小希希~',
        realName: '陈建希',
        idCard: '440902200001230432',
        address: '广东省茂名市茂南区官渡2路248号大院',
        mail: '1049602251@qq.com',
        role: 'ANCHOR',
        phone: '19927574191',
        vx: 'sxyyasw',
        password: md5('123123'),
        tags: {
          create: [
            {
              tag: {
                connect: {
                  name: '零食类',
                },
              },
            },
          ],
        },
      },
    }),
  ];
  Promise.all(proms).then((value: any) => {
    console.log('建好内容', value);
  }).catch((err: any) => console.error(err));
}

main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await db.$disconnect();
    });
