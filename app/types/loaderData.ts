import { Status, User, Order, Role, UserComment, Tag } from '@prisma/client';
import { SearchType, SessionUserData } from '.';
// import { MenuData } from './menu';

export interface RootLoaderData {
  user: User | null;
  // menuList: MenuData[];
  pathname: string;
};


export interface SearchLoaderData{
  searchKey: string | null;
  data: UserJoinTag[] | null;
  searchType: SearchType;
  total: number;
  page: number;
  pageSize: number;
};

export type UserJoinTag = {
  tags: Array<{userId: number; tagId: number; tag: { name: string }}>
  avgRating?: number | null;
  orderCount?: number | null;
} & User;

export interface ClassifyLoaderData{
  tagId: number | null;
  data: UserJoinTag[] | null | undefined;
  total: number;
  page: number;
  pageSize: number;
  tag: { name: string; id: number } | null;
};

export interface AuditUserLoaderData{
  data: UserJoinTag[] | null | undefined;
  total: number;
  searchKey: string | null;
  page: number;
  status: Status;
};

export interface OrderHistoryLoaderData{
  targetOrders: OrderJoinUserAndComment[],
  authorOrders: OrderJoinUserAndComment[],
  page: number;
  targetTotal: number;
  authorTotal: number;
  user: SessionUserData;
};

export type OrderJoinUserAndComment = {
  author: {
    name: string;
    role?: Role;
  }
  target: {
    role?: Role;
    name: string;
  }
  userComment?: {
    orderId: number;
    fromId: number;
    toId: number;
    rating: number;
    comment: string;
  }[];
} & Order;

export interface OrderDetailLoaderData{
  curUser: SessionUserData;
  orderInfo: OrderJoinUserAndComment;
};

export interface MatchLoaderData{
  count: UserJoinTag[] & { orderCount: number}[];
  quality: UserJoinTag[] & { avgRating: number }[];
  likeUsers: UserJoinTag[];
};

export interface InfoLoaderData{
  user: UserJoinTag;
  loginUser: User;
  allTags: { name: string; id: number; }[];
  commentData: {
    // 外接user表
    comments: CommentJoinUser[];
    avgRating: number;
  };
  dev: boolean;
  liveData: LiveDataItem[];
};

export type LiveDataItem = {
  target: {
    name: string;
    role: Role;
    id: number;
  };
  author: {
    name: string;
    id: number;
    role: Role;
  };
  isFinished?: boolean;
} & Order;

export type CommentJoinUser = {
  from: {
      name: string;
      avatarKey: string | null;
  };
} & UserComment;

export interface TagManagerLoader{
  data: ({ key: string; } & Tag)[];
  page: string;
  total: number;
  searchKey: string;
};

export interface HomeLoaderData{
  data: (UserJoinTag & { time: number; })[];
  curUser: UserJoinTag | null;
};

export interface AuditOrderLoader{
  data: OrderJoinAnchorAndCompany[] | null | undefined;
  total: number;
  searchKey: string | null;
  page: number;
};

export type OrderJoinAnchorAndCompany = (Order & { anchor: { id: number; name: string; }; company: { id: number; name: string; }; });

