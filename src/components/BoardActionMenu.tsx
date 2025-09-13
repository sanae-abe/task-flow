import { PencilIcon, TrashIcon, KebabHorizontalIcon, CheckCircleIcon, DownloadIcon, UploadIcon } from '@primer/octicons-react';
import { ActionMenu, ActionList } from '@primer/react';
import { memo } from 'react';

import SubHeaderButton from './SubHeaderButton';

/**
 * ボード設定用のアクションメニューコンポーネント
 * ボード管理、データの入出力、タスク管理の機能を提供
 */
interface BoardActionMenuProps {
  /** 完了したタスクが存在するかどうか */
  hasCompletedTasks: boolean;
  /** ボードを削除可能かどうか（複数ボードがある場合のみ可能） */
  canDeleteBoard: boolean;
  /** ボード作成時のコールバック */
  onCreateBoard: () => void;
  /** ボード名編集時のコールバック */
  onEditBoard: () => void;
  /** ボード削除時のコールバック */
  onDeleteBoard: () => void;
  /** 完了タスククリア時のコールバック */
  onClearCompletedTasks: () => void;
  /** 全データエクスポート時のコールバック */
  onExportData: () => void;
  /** 現在のボードエクスポート時のコールバック */
  onExportBoard: () => void;
  /** データインポート時のコールバック */
  onImportData: () => void;
}

const BoardActionMenu = memo<BoardActionMenuProps>(({
  hasCompletedTasks,
  canDeleteBoard,
  onCreateBoard,
  onEditBoard,
  onDeleteBoard,
  onClearCompletedTasks,
  onExportData,
  onExportBoard,
  onImportData,
}) => (
    <ActionMenu>
      <ActionMenu.Anchor>
        <SubHeaderButton 
          icon={KebabHorizontalIcon}
          aria-label="ボード設定メニューを開く"
        >
          ボード設定
        </SubHeaderButton>
      </ActionMenu.Anchor>
      <ActionMenu.Overlay>
        <ActionList>
          {/* ボード作成アクション */}
          <ActionList.Item onSelect={onCreateBoard}>
            <ActionList.LeadingVisual>
              <PencilIcon />
            </ActionList.LeadingVisual>
            新しいボード
          </ActionList.Item>
          
          {/* ボード管理アクション */}
          <ActionList.Item onSelect={onEditBoard}>
            <ActionList.LeadingVisual>
              <PencilIcon />
            </ActionList.LeadingVisual>
            ボード名を編集
          </ActionList.Item>
          
          {/* データ管理アクション */}
          <ActionList.Divider />
          <ActionList.Item onSelect={onExportData}>
            <ActionList.LeadingVisual>
              <DownloadIcon />
            </ActionList.LeadingVisual>
            全データをエクスポート
          </ActionList.Item>
          <ActionList.Item onSelect={onExportBoard}>
            <ActionList.LeadingVisual>
              <DownloadIcon />
            </ActionList.LeadingVisual>
            このボードをエクスポート
          </ActionList.Item>
          <ActionList.Item onSelect={onImportData}>
            <ActionList.LeadingVisual>
              <UploadIcon />
            </ActionList.LeadingVisual>
            データをインポート
          </ActionList.Item>

          {/* タスク管理アクション */}
          {hasCompletedTasks && (
            <>
              <ActionList.Divider />
              <ActionList.Item onSelect={onClearCompletedTasks}>
                <ActionList.LeadingVisual>
                  <CheckCircleIcon />
                </ActionList.LeadingVisual>
                完了したタスクをクリア
              </ActionList.Item>
            </>
          )}

          {/* 危険なアクション */}
          {canDeleteBoard && (
            <>
              <ActionList.Divider />
              <ActionList.Item
                variant="danger"
                onSelect={onDeleteBoard}
              >
                <ActionList.LeadingVisual>
                  <TrashIcon />
                </ActionList.LeadingVisual>
                ボードを削除
              </ActionList.Item>
            </>
          )}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  ));

BoardActionMenu.displayName = 'BoardActionMenu';

export default BoardActionMenu;