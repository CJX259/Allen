import { Goods, User } from '@prisma/client';
import { SearchType, SessionUserData } from '.';
// import { MenuData } from './menu';

export interface RootLoaderData {
  user: SessionUserData | null;
  // menuList: MenuData[];
  pathname: string;
};


export interface SearchLoaderData{
  searchKey: string | null;
  data: User[] | Goods[] | null;
  searchType: SearchType;
  total: number;
  page: number;
  pageSize: number;
};
