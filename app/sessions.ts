// app/sessions.js
import { createCookieSessionStorage } from 'remix';

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: 'AllenUser',

      // all of these are optional
      // domain: '/',
      expires: new Date(Date.now() + 60_000),
      httpOnly: true,
      maxAge: 600,
      path: '/',
      sameSite: 'lax',
      secrets: ['s3cret1'],
      secure: true,
    },
  });

export { getSession, commitSession, destroySession };
