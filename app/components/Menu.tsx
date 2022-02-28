import { AppstoreOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import SubMenu from 'antd/lib/menu/SubMenu';
import React from 'react';

export default function MenuCmp() {
  // 需要对不同类型的用户展示不同的菜单列表
  return (
    <Menu
      style={{ width: 256 }}
      defaultSelectedKeys={['1']}
      defaultOpenKeys={['sub1']}
      mode="inline"
    >
      <SubMenu key="qqq" icon={<MailOutlined />} title="Navigation One">
        <Menu.ItemGroup key="q1" title="Item 1">
          <Menu.Item key="qq1">Option 1</Menu.Item>
          <Menu.Item key="qq2">Option 2</Menu.Item>
        </Menu.ItemGroup>
        <Menu.ItemGroup key="q2" title="Item 2">
          <Menu.Item key="qq3">Option 3</Menu.Item>
          <Menu.Item key="qq4">Option 4</Menu.Item>
        </Menu.ItemGroup>
      </SubMenu>
      {/* <SubMenu key="q3" icon={<AppstoreOutlined />} title="Navigation Two">
        <Menu.Item key="qq5">Option 5</Menu.Item>
        <Menu.Item key="qq6">Option 6</Menu.Item>
        <SubMenu key="q4" title="Submenu">
          <Menu.Item key="qq7">Option 7</Menu.Item>
          <Menu.Item key="qq8">Option 8</Menu.Item>
        </SubMenu>
      </SubMenu>
      <SubMenu key="qqqq" icon={<SettingOutlined />} title="Navigation Three">
        <Menu.Item key="qq9">Option 9</Menu.Item>
        <Menu.Item key="qq10">Option 10</Menu.Item>
        <Menu.Item key="qq11">Option 11</Menu.Item>
        <Menu.Item key="qq12">Option 12</Menu.Item>
      </SubMenu> */}
    </Menu>
  );
};
