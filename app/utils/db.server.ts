import { PrismaClient } from '@prisma/client';

let db: PrismaClient;

let __db: PrismaClient | undefined;
// declare global {
//   let __db: PrismaClient | undefined;
// }
// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
if (process.env.NODE_ENV === 'production') {
  db = new PrismaClient();
  db.$connect();
} else {
  if (!__db) {
    __db = new PrismaClient();
    __db.$connect();
  }
  db = __db;
}

export { db };
