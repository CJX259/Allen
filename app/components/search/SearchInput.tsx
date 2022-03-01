import React, { useState } from 'react';
import { Input, Button } from 'antd';
import { useActionData, useSubmit } from 'remix';
import { SearchOutlined } from '@ant-design/icons';

export default function SearchInput(props: any) {
  const [searchKey, setSearchKey] = useState('');
  const submit = useSubmit();
  const searchData = useActionData();
  console.log('actionData', searchData);
  return (
    <div className='search-input'>
      <Input value={searchKey} onChange={(e) => setSearchKey(e.target.value)}/>
      <Button
        type='primary'
        onClick={() => submit({ searchKey }, {
          method: 'post',
        })}
        icon={<SearchOutlined />}
      >搜索</Button>
    </div>
  );
};
