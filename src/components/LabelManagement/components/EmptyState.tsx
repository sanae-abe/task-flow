import React from 'react';

const EmptyState: React.FC = () => (
  <div className='text-center py-6 border border-border border-dashed rounded-md flex flex-col gap-2 justify-center items-center'>
    <span className='text-zinc-700'>まだラベルがありません</span>
  </div>
);

export default EmptyState;
