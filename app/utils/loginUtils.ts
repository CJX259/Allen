import { getSession, commitSession } from '../sessions';
import { LoginKey } from '../const';


export async function hadLogin(cookie: string | null) {
  const session = await getSession(cookie);
  return session.has(LoginKey);
}

