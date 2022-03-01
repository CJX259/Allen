import { Menu } from 'antd';
import SubMenu from 'antd/lib/menu/SubMenu';
import { Link } from 'remix';
import React from 'react';
import { MenuData, MenuItem } from '~/types/menu';
import { Role } from '@prisma/client';
import { RootLoaderData } from '~/types/loaderData';

export default function MenuCmp(props: { data: RootLoaderData }) {
  const { data: { user, pathname = '' } } = props;
  const renderMenuList: MenuData[] = calcMenuList(user?.role);
  const openKey = findOpenKey(pathname, renderMenuList);
  // 需要对不同类型的用户展示不同的菜单列表
  return (
    <Menu
      style={{ width: 256 }}
      defaultSelectedKeys={[pathname]}
      defaultOpenKeys={[openKey?.subTitle || '']}
      mode="inline"
    >
      <Menu.Item key='/home'>
        <Link
          to='/home'
          prefetch='intent'
        >主页</Link>
      </Menu.Item>
      {renderMenu(renderMenuList)}
    </Menu>
  );
};

function calcMenuList(role: Role | undefined): MenuData[] {
  // 根据角色类型，返回不同的菜单列表
  const base = [
    {
      subTitle: '查询系统',
      children: [
        {
          title: '商品查询',
          to: '/search/goods',
        },
        {
          title: '用户查询',
          to: '/search/user',
        },
        {
          title: '分类查看',
          to: '/classify',
        },
      ],
    },
  ];
  switch (role) {
    case Role.ADMIN: {
      base.push({
        subTitle: '审核系统',
        children: [
          {
            title: '主播审核',
            to: '/audit/anchor',
          },
          {
            title: '商品审核',
            to: '/audit/goods',
          },
          {
            title: '供应商审核',
            to: '/audit/compayn',
          },
        ],
      });
      break;
    }
    case Role.ANCHOR:
      // anchor与company相同
    case Role.COMPANY: {
      break;
    }
  }
  return base;
}


/**
 * 渲染menu
 *
 * @param {MenuData[]} menuList
 * @return {*} JSX.Element
 */
function renderMenu(menuList: MenuData[]) {
  const subMenus = menuList.map((menu: MenuData, index: number) => {
    const menuItem = menu.children;
    return (
      <SubMenu key={menu.subTitle || index} title={menu.subTitle}>
        {menuItem.map((item: MenuItem) => {
          return <Menu.Item key={item.to}>
            <Link
              to={item.to}
              prefetch='intent'
            >{item.title}
            </Link>
          </Menu.Item>;
        })}
      </SubMenu>
    );
  });
  return <>{subMenus}</>;
};


/**
 * 遍历找出目前menu的父级submenu
 *
 * @param {string} to
 * @param {MenuData[]} menuList
 * @return {*} string
 */
function findOpenKey(to: string, menuList: MenuData[]) {
  const openmenu = menuList.find((menu) => {
    return menu.children.some((childMenu) => childMenu.to === to);
  });
  return openmenu;
};
