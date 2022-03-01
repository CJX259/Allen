import React from 'react';
import SearchInput from './SearchInput';

export default function SearchComp() {
  return (
    <div className='search-wrapper'>
      {/* 搜索框区域 */}
      <SearchInput />
      {/* 搜索结果展示区 */}
      <div className="search-content">
      </div>
    </div>
  );
};
