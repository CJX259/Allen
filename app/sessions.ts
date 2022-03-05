// app/sessions.js
import { createCookieSessionStorage } from 'remix';

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: 'AllenUser',

      // all of these are optional
      // domain: '/',
      // expires: new Date(Date.now() + 60_000),
      httpOnly: true,
      maxAge: 60000,
      path: '/',
      sameSite: 'lax',
      secrets: ['s3cret1'],
      secure: true,
    },
  });

export { getSession, commitSession, destroySession };

// 文件版  垃圾，自动刷新我页面
// // app/sessions.js
// import {
//   createCookie,
//   createFileSessionStorage,
// } from 'remix';

// // In this example the Cookie is created separately.
// const sessionCookie = createCookie('__session', {
//   secrets: ['r3m1xr0ck5'],
//   sameSite: true,
// });

// const { getSession, commitSession, destroySession } =
//   createFileSessionStorage({
//     // The root directory where you want to store the files.
//     // Make sure it's writable!
//     dir: './app/sessions',
//     cookie: sessionCookie,
//   });

// export { getSession, commitSession, destroySession };
