import React from 'react';
import { Trash2 } from 'lucide-react';
import { UI_TEXT } from '../../../constants/recycleBin';

/**
 * ゴミ箱が空の場合の表示コンポーネント
 */
export const RecycleBinEmptyState: React.FC = () => (
  <div className='text-center py-6 border border-border border-dashed rounded-md flex flex-col gap-3 justify-center items-center mb-4 text-zinc-700'>
    <Trash2 size={24} />
    <div className='flex flex-col gap-1'>
      <h2 className='text-lg font-semibold text-foreground m-0'>
        {UI_TEXT.VIEW.EMPTY_TITLE}
      </h2>
      <span className='text-sm text-zinc-700'>
        {UI_TEXT.VIEW.EMPTY_DESCRIPTION}
      </span>
    </div>
  </div>
);
