export interface MenuData {
  subTitle: string;
  children: MenuItem[];
};

export interface MenuItem {
  title: string;
  to: string;
};
