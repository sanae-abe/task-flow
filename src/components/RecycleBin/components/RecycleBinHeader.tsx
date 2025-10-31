import React from 'react';
import { Trash2 } from 'lucide-react';
import { UI_TEXT, MESSAGES } from '../../../constants/recycleBin';
import { type RecycleBinSettings } from '../../../types/settings';
import { LoadingButton } from '../../shared/LoadingButton';
import { InlineMessage } from '../../shared';

export interface RecycleBinHeaderProps {
  /** 削除されたタスクの数 */
  taskCount: number;
  /** ゴミ箱設定 */
  settings: RecycleBinSettings;
  /** ゴミ箱を空にしている最中かどうか */
  isEmptying: boolean;
  /** ゴミ箱を空にするボタンのクリックハンドラ */
  onEmptyClick: () => void;
}

/**
 * ゴミ箱ビューのヘッダーコンポーネント
 * タイトル、タスク数、空にするボタン、警告メッセージを表示
 */
export const RecycleBinHeader: React.FC<RecycleBinHeaderProps> = ({
  taskCount,
  settings,
  isEmptying,
  onEmptyClick,
}) => (
  <div className='mb-4'>
    <div className='flex justify-between items-center'>
      <h2 className='text-base font-bold flex items-center gap-2 m-0'>
        <Trash2 size={16} />
        {UI_TEXT.VIEW.TITLE}
      </h2>
      <LoadingButton
        primerVariant='danger'
        primerSize='small'
        isLoading={isEmptying}
        loadingText={MESSAGES.EMPTY_BIN.IN_PROGRESS}
        onClick={onEmptyClick}
      >
        <span className='flex items-center gap-1'>
          <Trash2 size={14} />
          {UI_TEXT.VIEW.EMPTY_BIN_BUTTON}
        </span>
      </LoadingButton>
    </div>

    <div className='my-3 text-zinc-700 text-sm'>
      {UI_TEXT.VIEW.TASK_COUNT(taskCount)}
    </div>

    <div className='mb-3'>
      <InlineMessage
        variant='warning'
        message={
          settings.retentionDays === null
            ? UI_TEXT.VIEW.WARNING_UNLIMITED
            : UI_TEXT.VIEW.WARNING_LIMITED(settings.retentionDays)
        }
      />
    </div>
  </div>
);
