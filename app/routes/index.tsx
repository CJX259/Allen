import { LoaderFunction, useLoaderData } from 'remix';
import React from 'react';
import type { User } from '@prisma/client';
import { db } from '~/utils/db.server';
import { getSession } from '~/sessions';

type LoaderData = { users: Array<User> };
export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(
      request.headers.get('Cookie'),
  );
  console.log('session', session.data);
  const data: LoaderData = {
    users: await db.user.findMany(),
  };
  return data;
};


/**
 * 默认主页
 *
 * @export
 * @return {*}
 */
export default function Index() {
  const data = useLoaderData();
  console.log('data', data);
  return (
    <div style={{fontFamily: 'system-ui, sans-serif', lineHeight: '1.4'}}>
      <h1>Welcome to Remix</h1>
      <ul>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/blog"
            rel="noreferrer"
          >
            15m Quickstart Blog Tutorial
          </a>
        </li>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/jokes"
            rel="noreferrer"
          >
            Deep Dive Jokes App Tutorial
          </a>
        </li>
        <li>
          <a target="_blank" href="https://remix.run/docs" rel="noreferrer">
            Remix Docs
          </a>
        </li>
      </ul>
    </div>
  );
}
