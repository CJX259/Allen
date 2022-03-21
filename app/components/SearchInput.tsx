import { Button, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import React, { useState } from 'react';

export default function SearchInput(props: { defaultKey: string, sendSearch: Function, setSearchKey: Function }) {
  const { sendSearch, setSearchKey, defaultKey } = props;
  const [key, setKey] = useState(defaultKey || '');
  return (
    <div className='search-input'>
      <Input
        value={key}
        placeholder='可通过id与昵称搜索'
        onKeyPress={(e) => e.key === 'Enter' && sendSearch() }
        onChange={(e) => {
          setSearchKey(e.target.value);
          setKey(e.target.value);
        }}
      />
      <Button
        type='primary'
        onClick={() => sendSearch()}
        icon={<SearchOutlined />}
      >搜索</Button>
    </div>
  );
}
