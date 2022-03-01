import React, { useState } from 'react';
import { Input, Button } from 'antd';
import { useLoaderData, useSubmit } from 'remix';
import { SearchOutlined } from '@ant-design/icons';

export default function SearchInput(props: any) {
  const [searchKey, setSearchKey] = useState('');
  const submit = useSubmit();
  const searchData = useLoaderData();
  console.log('actionData', searchData);
  return (
    <div className='search-input'>
      <Input value={searchKey} onChange={(e) => setSearchKey(e.target.value)}/>
      <Button
        type='primary'
        onClick={() => submit({ key: searchKey }, {
          method: 'get',
        })}
        icon={<SearchOutlined />}
      >搜索</Button>
    </div>
  );
};
