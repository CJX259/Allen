import { renderToString } from 'react-dom/server';
import React from 'react';
import { RemixServer } from 'remix';
import type { EntryContext } from 'remix';

/**
 * exporess服务器渲染的处理函数
 *
 * @export
 * @param {Request} request
 * @param {number} responseStatusCode
 * @param {Headers} responseHeaders
 * @param {EntryContext} remixContext
 * @return {*}
 */
export default function handleRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    remixContext: EntryContext,
) {
  const markup = renderToString(
      <RemixServer context={remixContext} url={request.url} />,
  );

  responseHeaders.set('Content-Type', 'text/html');

  return new Response('<!DOCTYPE html>' + markup, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}
