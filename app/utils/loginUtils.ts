import { redirect } from 'remix';
import { getSession } from '../sessions';
import { LoginKey } from '../const';


/**
 * 判断session，是否已经登录
 *
 * @export
 * @param {(string | null)} cookie
 * @return {*} boolean
 */
export async function hadLogin(cookie: string | null) {
  const session = await getSession(cookie);
  return session.has(LoginKey);
}


/**
 * 用于需要登录才能访问的页面，未登录则跳转到主页
 *
 * @export
 * @param {Request} request
 * @return {*} Response
 */
export async function needLogined(request: Request) {
  const cookie = request.headers.get('Cookie');
  return await hadLogin(cookie) ? redirect('/') : null;
};