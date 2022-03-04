import React from 'react';
import { Link } from 'remix';

export default function ClassifyCardItem(props: { data: { name: string; id: number }}) {
  const { data: { name, id } } = props;
  return (
    <Link to={`/classify/${id}`}>
      <div className="tag-item">
        <div className="tag-item-header">{name.slice(0, 1)}</div>
        <span>{name}</span>
      </div>
    </Link>
  );
};
