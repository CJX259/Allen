import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

async function main() {
  const alice = await db.user.create({
    data: {
      name: 'jessy1',
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
    await db.$disconnect()
  })