import { List, Comment, Rate, Space } from 'antd';
import moment from 'moment';
import React, { useEffect } from 'react';
import { CommentJoinUser } from '~/types';
import { getImgUrl } from '~/utils/cos';

export default function CommentComp(props: { data: CommentJoinUser[]}) {
  const { data } = props;
  console.log('data', data);
  useEffect(() => {
    // 获取头像URL
    data.forEach((item) => {
      if (item.from.avatarKey) {
        getImgUrl(item.from.avatarKey, (result) => {
          item.from.avatarKey = result.Url;
        });
      }
    });
  }, [data]);
  return (
    <div className='comment-wrapper'>
      <List
        className="comment-list"
        header={`${data?.length} replies`}
        itemLayout="horizontal"
        dataSource={data}
        renderItem={(item) => (
          <li>
            <Comment
              author={item.from.name}
              avatar={item.from.avatarKey}
              content={item.comment || '仅评分，没有评论'}
              datetime={(
                <Space>
                  <span>
                    {moment(item.ctime).fromNow()}
                  </span>
                  <Rate disabled value={item.rating}/>
                </Space>
              )}
            />
          </li>
        )}
      />
    </div>
  );
}
