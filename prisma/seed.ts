import { PrismaClient, Role } from '@prisma/client';
const db = new PrismaClient();
import md5 from 'md5';
import Mock from 'mockjs';
import { ROLE_MAP } from '~/const';

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
        name: '建希哥',
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

  // 下面创建海量数据
  const createUsers = [] as any[];
  const createSomeUsers = initSomeUsers();
  // 25个主播数据
  createSomeUsers(createUsers, Role.ANCHOR, 25);
  // 25个供应商数据
  createSomeUsers(createUsers, Role.COMPANY, 25);
  console.log('create', createUsers);
  const res = await Promise.all(createUsers);
  console.log('res', res);
}
function initSomeUsers() {
  // 第几次执行该函数，做个区分，不然第二次再执行时就有重复数据了
  let num = 0;
  return async function(arr: any[], role: Role, count: number) {
    num++;
    for (let i = 0; i < count; i++) {
      const data = {
        name: `${ROLE_MAP[role]}_${num}_${i}`,
        realName: Mock.mock('@cname'),
        idCard: Mock.mock('@id'),
        address: Mock.mock('@county(true)'),
        mail: Mock.mock('@email'),
        role,
        phone: mockPhone(),
        vx: '1',
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
      };
      arr.push(await db.user.create({ data }));
    }
  };
}

// 生成随机phone
function mockPhone() {
  const phonePrefix = ['132', '199', '135', '187', '189'];
  const index = Math.floor(Math.random() * phonePrefix.length);
  return phonePrefix[index] + Mock.mock(/\d{8}/);
}

main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await db.$disconnect();
    });
