import { Role } from '@prisma/client';
import md5 from 'md5';
import { json, redirect, Session } from 'remix';
import { PARAMS_ERROR, TIME_OUT, USER_ERROR, VERIFY_ERROR } from '~/error';
import { commitSession, destroySession, getSession } from '~/sessions';
import { SessionCodeData, SessionRegisterData, SessionUserData } from '~/types';
import { CodeKey, CODE_WAITING, LoginKey, RegisterKey } from '../const';
import { db } from './db.server';
import { sendVerCode } from './sendMessage';


/**
 * 判断session，是否已经登录
 *
 * @export
 * @param {Session} session
 * @return {*} boolean
 */
export async function hadLogin(session: Session) {
  return session.has(LoginKey);
}


/**
 * 用于需要登录才能访问的页面，未登录则跳转到主页
 * roles为允许访问的角色
 *
 * @export
 * @param {Request} request
 * @param {Role[]} roles
 * @return {*}
 */
export async function needLogined(request: Request, roles?: Role[]) {
  const cookie = request.headers.get('Cookie');
  const session = await getSession(cookie);
  if (roles) {
    const { role } = session.get(LoginKey) || {};
    return roles.indexOf(role) === -1 ? redirect('/home') : null;
  }
  return await hadLogin(session) ? null : redirect('/home');
};

export async function getSessionUserData(request: Request): Promise<SessionUserData> {
  const session = await getSession(request.headers.get('Cookie'));
  return session.get(LoginKey);
}

/**
 * 未登录才能访问的页面，登录了则跳转到主页
 *
 * @export
 * @param {Request} request
 * @return {*}
 */
export async function unNeedLogined(request: Request) {
  const cookie = request.headers.get('Cookie');
  const session = await getSession(cookie);
  return await hadLogin(session) ? redirect('/home') : null;
};

/**
 * 校验phone参数
 *
 * @param {string} phone
 * @return {*} Response
 */
export function validatePhone(phone: string) {
  // 判断有无电话数据
  if (!phone) {
    return json(PARAMS_ERROR);
  }
  const phoneReg = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
  if (!phoneReg.test(phone as string)) {
    return json(VERIFY_ERROR);
  }
}

/**
 * 登出逻辑
 *
 * @param {Session} session
 * @return {*} Response
 */
export async function handleLogout(session: Session) {
  // 已登录则注销session
  const handleSession = await destroySession(session);
  return new Response('登出成功', {
    headers: {
      'Set-Cookie': handleSession,
    },
  });
}
/**
 * action处理发送验证码逻辑
 *
 * @param {Session} session
 * @param {string} phone
 * @return {*} Response
 */
export async function handleCodeSend(session: Session, phone: string) {
  const curTime = new Date().valueOf();
  // 判断session，如果该电话数据的还未过期，则不允许发送
  const codeData: SessionCodeData = session.get(CodeKey);
  if (codeData?.phone === phone && curTime - codeData?.sendTime <= CODE_WAITING * 1000) {
    // session里有该手机的数据，且未过60秒
    return json(TIME_OUT);
  }
  // 生成随机数
  const random = `${Math.floor(Math.random() * 1000000)}`;
  console.log('random', random);
  // 设置手机号与随机数到session中，用于post登录时判断（过期时间60秒）
  session.set(CodeKey, {
    phone,
    code: random,
    sendTime: curTime,
  });
  try {
    // 调用api发送短信，先注释掉，短信有次数
    sendVerCode([phone as string], [random]);
    // return '发送成功';
    const handleSession = await commitSession(session);
    return new Response('发送成功', {
      headers: {
        'Set-Cookie': handleSession,
      },
    });
  } catch (error: any) {
    console.log('send Error', error.message);
    return json('发送失败');
  };
}

/**
 * 校验用户输入的账号密码是否正确
 *
 * @param {Session} session
 * @param {string} phone
 * @param {string} password
 * @return {*} Response
 */
export async function verifyPsw(session: Session, phone: string, password: string) {
  const user = await db.user.findFirst({
    where: {
      phone: phone as string,
      password: md5(password as string),
    },
    select: {
      id: true,
      role: true,
    },
  });
  if (user == null) {
    return json(USER_ERROR);
  }
  session.set(LoginKey, user as SessionUserData);
  // Login succeeded, send them to the home page.
  const handleSession = await commitSession(session);
  return redirect('/home', {
    headers: {
      'Set-Cookie': handleSession,
    },
  });
};


/**
 * 校验验证码，处理跳转页面逻辑
 *
 * @param {Session} session
 * @param {string} phone
 * @param {string} code
 * @return {*} redirect
 */
export async function verifyCode(session: Session, phone: string, code: string) {
  // 拿session中的phone数据，与code参数比较，若一致，则通过
  const codeData: SessionCodeData = await session.get(CodeKey);
  if (!codeData) {
    return json(PARAMS_ERROR);
  }
  if (codeData.code !== code || codeData.phone !== phone) {
    return json(VERIFY_ERROR);
  }
  // 通过后，若数据库中有该账号，则直接登录
  const user = await db.user.findFirst({
    where: {
      phone,
    },
    select: {
      id: true,
      role: true,
    },
  });
  // 清除session
  session.set(CodeKey, null);
  let to = '/home';
  if (!user) {
    // 没创建，进入注册页，设置session
    to = '/register';
    session.set(RegisterKey, {
      phone,
    } as SessionRegisterData);
  } else {
    // 如果已有账号，则设置cookie
    session.set(LoginKey, user as SessionUserData);
  }
  const handleSession = await commitSession(session);

  return redirect(to, {
    headers: {
      'Set-Cookie': handleSession,
    },
  });
};
