import { SessionUserData } from '.';
import { MenuData } from './menu';

export interface RootLoaderData {
  user: SessionUserData | null;
  menuList: MenuData[];
  pathname: string;
};
