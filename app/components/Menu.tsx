// import { MailOutlined, SearchOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import SubMenu from 'antd/lib/menu/SubMenu';
import { Link } from 'remix';
import React from 'react';
import { MenuData, MenuItem } from '~/types/menu';

export default function MenuCmp(props: { menuList: MenuData[], pathname: string }) {
  const { menuList = [], pathname = '' } = props;
  const renderMenuList: MenuData[] = [
    {
      subTitle: '查询系统',
      children: [
        {
          title: '主播查询',
          to: '/search/anchor',
        },
        {
          title: '供应商查询',
          to: '/search/company',
        },
        {
          title: '商品查询',
          to: '/search/goods',
        },
        {
          title: '登录',
          to: '/login',
        },
      ],
    },
  ];
  const openKey = findOpenKey(pathname, renderMenuList);
  // 混合loader与base的menu
  menuList.forEach((menu) => {
    renderMenuList.push(menu);
  });
  console.log('paht', pathname);
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
