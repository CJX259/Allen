export interface SearchCardItem {
  name: string;
  info: string;
  price?: number;
};

// CardItem展示的类型
export enum RenderType{
  USER = 1,
  GOODS
};
