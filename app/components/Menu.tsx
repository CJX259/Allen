import { Menu } from 'antd';
import SubMenu from 'antd/lib/menu/SubMenu';
import { Link } from 'remix';
import React from 'react';
import { MenuData, MenuItem } from '~/types/menu';
import { Role } from '@prisma/client';
import { RootLoaderData } from '~/types/loaderData';
import CloudConfig from '~/../cloudConfig.json';

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
      {user?.role &&
        <Menu.Item key='/editPassword'>
          <Link
            to='/editPassword'
            prefetch='intent'
          >修改密码</Link>
        </Menu.Item>
      }
      {user?.role === Role.ANCHOR &&
        <Menu.Item key='/pusher/index.html'>
          <a
            target="_blank" rel="noreferrer"
            href={`/pusher/index.html?expireTime=${CloudConfig.expireTime}&roomId=${user.id}&roomName=${user.name}的直播间&userId=${user.id}&userName=${user.name}&secretKey=${CloudConfig.secretKey}&sdkAppId=${CloudConfig.sdkAppId}`}
          >我的直播间</a>
        </Menu.Item>
      }
      {user?.role === Role.ADMIN &&
        <Menu.Item key='/destoryRoom'>
          <Link to='/destoryRoom' prefetch='intent'
          >关闭直播间</Link>
        </Menu.Item>
      }
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
  if (role === Role.ADMIN) {
    base.push({
      subTitle: '审核系统',
      children: [
        {
          title: '用户审核',
          to: '/auditUser',
        },
        {
          title: '订单审核',
          to: '/auditOrder',
        },
        {
          title: '标签管理',
          to: '/tagManager',
        },
      ],
    });
  } else if (role === Role.COMPANY || role === Role.ANCHOR) {
    base.push({
      subTitle: '签约系统',
      children: [
        {
          title: '匹配用户',
          to: '/match',
        },
        {
          title: '签约记录',
          to: '/order/history',
        },
      ],
    });
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
