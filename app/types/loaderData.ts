import { User } from '@prisma/client';
import { SessionUserData } from '.';
// import { MenuData } from './menu';

export interface RootLoaderData {
  user: SessionUserData | null;
  // menuList: MenuData[];
  pathname: string;
};


export interface SearchLoaderData{
  searchKey: string | null;
  data: User[] | null;
};
