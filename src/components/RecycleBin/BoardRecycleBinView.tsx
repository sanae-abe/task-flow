import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Loader2, RotateCcw, Trash2, MoreHorizontal } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { useBoard } from '../../contexts/BoardContext';
import { getRecycleBinBoards } from '../../utils/recycleBin';
import ConfirmDialog from '../ConfirmDialog';
import { LoadingButton } from '../shared/LoadingButton';
import type { DialogFlashMessageData } from '../shared/DialogFlashMessage';

interface BoardRecycleBinViewProps {
  onMessage?: (message: DialogFlashMessageData) => void;
}

const BoardRecycleBinView: React.FC<BoardRecycleBinViewProps> = ({
  onMessage,
}) => {
  const { state, restoreBoard, permanentlyDeleteBoard, emptyBoardRecycleBin } =
    useBoard();
  const [restoringBoardId, setRestoringBoardId] = useState<string | null>(null);
  const [deletingBoardId, setDeletingBoardId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
  const [emptyingRecycleBin, setEmptyingRecycleBin] = useState(false);

  // 削除されたボードを取得
  const deletedBoards = useMemo(
    () => getRecycleBinBoards(state.boards),
    [state.boards]
  );

  /**
   * ボード復元の統一エラーハンドリング
   */
  const handleRestore = async (boardId: string) => {
    const board = deletedBoards.find(b => b.id === boardId);
    const boardTitle = board?.title || 'ボード';

    setRestoringBoardId(boardId);
    try {
      restoreBoard(boardId);
      onMessage?.({
        type: 'success',
        text: `ボード「${boardTitle}」を復元しました`,
      });
    } catch (_error) {
      // eslint-disable-next-line no-console
      console.error('Board restore failed:', _error);
      onMessage?.({
        type: 'danger',
        text: `ボード「${boardTitle}」の復元に失敗しました`,
      });
    } finally {
      setRestoringBoardId(null);
    }
  };

  /**
   * ボード完全削除の統一エラーハンドリング
   */
  const handlePermanentDelete = async (boardId: string) => {
    const board = deletedBoards.find(b => b.id === boardId);
    const boardTitle = board?.title || 'ボード';

    setDeletingBoardId(boardId);
    try {
      permanentlyDeleteBoard(boardId);
      onMessage?.({
        type: 'success',
        text: `ボード「${boardTitle}」を完全に削除しました`,
      });
    } catch (_error) {
      // eslint-disable-next-line no-console
      console.error('Board permanent delete failed:', _error);
      onMessage?.({
        type: 'danger',
        text: `ボード「${boardTitle}」の完全削除に失敗しました`,
      });
    } finally {
      setDeletingBoardId(null);
      setShowDeleteConfirm(null);
    }
  };

  /**
   * ゴミ箱を空にする処理の統一エラーハンドリング
   */
  const handleEmptyRecycleBin = async () => {
    const boardCount = deletedBoards.length;

    setEmptyingRecycleBin(true);
    try {
      emptyBoardRecycleBin();
      onMessage?.({
        type: 'success',
        text: `${boardCount}件のボードを完全に削除しました`,
      });
    } catch (_error) {
      // eslint-disable-next-line no-console
      console.error('Empty recycle bin failed:', _error);
      onMessage?.({
        type: 'danger',
        text: 'ゴミ箱を空にすることに失敗しました',
      });
    } finally {
      setEmptyingRecycleBin(false);
      setShowEmptyConfirm(false);
    }
  };

  if (deletedBoards.length === 0) {
    return (
      <div className='p-4 text-center'>
        <p className='text-zinc-700 text-sm'>ゴミ箱にボードはありません</p>
      </div>
    );
  }

  return (
    <div>
      <div className='flex justify-between items-center mb-3'>
        <h3 className='text-lg font-semibold'>
          削除されたボード ({deletedBoards.length}件)
        </h3>
        <Button
          variant='destructive'
          size='sm'
          onClick={() => setShowEmptyConfirm(true)}
          disabled={emptyingRecycleBin || deletedBoards.length === 0}
        >
          {emptyingRecycleBin ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              削除中...
            </>
          ) : (
            'ゴミ箱を空にする'
          )}
        </Button>
      </div>

      <div className='flex flex-col gap-2'>
        {deletedBoards.map(board => (
          <div
            key={board.id}
            className='p-3 border border-border border-gray-200 rounded-md bg-gray-50'
          >
            <div className='flex justify-between items-start gap-3'>
              <div className='flex-1 min-w-0'>
                <h4 className='text-sm font-semibold mb-1 break-words'>
                  {board.title}
                </h4>
                <p className='text-xs text-zinc-700'>
                  削除日時:{' '}
                  {new Date(board.deletedAt || '').toLocaleString('ja-JP')}
                </p>
                <p className='text-xs text-zinc-700 mt-1'>
                  カラム数: {board.columns.length}個
                </p>
              </div>

              <div className='flex gap-2 shrink-0'>
                {restoringBoardId === board.id ||
                deletingBoardId === board.id ? (
                  <LoadingButton
                    disabled
                    isLoading
                    loadingText={
                      restoringBoardId === board.id ? '復元中...' : '削除中...'
                    }
                  >
                    処理中
                  </LoadingButton>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size='sm' variant='outline'>
                        <MoreHorizontal size={16} className='mr-2' />
                        操作
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleRestore(board.id)}>
                        <RotateCcw size={16} className='mr-2' />
                        復元
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setShowDeleteConfirm(board.id)}
                        className='text-destructive focus:text-destructive'
                      >
                        <Trash2 size={16} className='mr-2' />
                        完全に削除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={showEmptyConfirm}
        title='ボードゴミ箱を空にする'
        message={`ゴミ箱内の${deletedBoards.length}件のボードをすべて完全削除します。この操作は取り消すことができません。本当に実行しますか？`}
        onConfirm={handleEmptyRecycleBin}
        onCancel={() => setShowEmptyConfirm(false)}
        confirmText='完全削除'
        cancelText='キャンセル'
      />

      {/* 個別完全削除の確認ダイアログ */}
      {showDeleteConfirm && (
        <ConfirmDialog
          isOpen={!!showDeleteConfirm}
          title='ボードの完全削除'
          message={`ボード「${deletedBoards.find(b => b.id === showDeleteConfirm)?.title || ''}」を完全に削除しますか？この操作は元に戻せません。`}
          onConfirm={() => handlePermanentDelete(showDeleteConfirm)}
          onCancel={() => setShowDeleteConfirm(null)}
          confirmText='完全に削除'
          cancelText='キャンセル'
        />
      )}
    </div>
  );
};

export default BoardRecycleBinView;
