import { useMemo } from 'react';
import {
  FolderKanban,
  Columns,
  ListTodo,
} from 'lucide-react';
import type { RecycleBinItem } from '../../../../../types/recycleBin';
import { getItemTypeColors } from '../styles/designTokens';

/**
 * アイテム種別に応じた情報を取得するカスタムフック
 * パフォーマンス最適化のためuseMemoを使用
 */
export const useItemTypeInfo = (type: RecycleBinItem['type']) => useMemo(() => {
    const baseInfo = (() => {
      switch (type) {
        case 'task':
          return {
            typeText: 'タスク',
            typeTextEn: 'Task',
            Icon: ListTodo,
            description: 'タスクアイテム',
          };
        case 'board':
          return {
            typeText: 'ボード',
            typeTextEn: 'Board',
            Icon: FolderKanban,
            description: 'ボードアイテム',
          };
        case 'column':
          return {
            typeText: 'カラム',
            typeTextEn: 'Column',
            Icon: Columns,
            description: 'カラムアイテム',
          };
        default:
          return {
            typeText: 'アイテム',
            typeTextEn: 'Item',
            Icon: ListTodo,
            description: '不明なアイテム',
          };
      }
    })();

    const colors = getItemTypeColors(type);

    return {
      ...baseInfo,
      colors,
      // アクセシビリティ用のラベル
      ariaLabel: `${baseInfo.typeText}の詳細情報`,
      // バッジ用のプロパティ
      badgeProps: {
        sx: {
          fontSize: 1,
          px: 2,
          py: 1,
          bg: colors.badge.bg,
          color: colors.badge.fg,
          borderRadius: 2,
          fontWeight: 'semibold',
          flexShrink: 0,
        },
      },
      // アイコン用のプロパティ
      iconProps: {
        size: 20,
        'aria-hidden': true,
        style: { flexShrink: 0 },
      },
      // Hero Sectionアイコン用（大きめ）
      heroIconProps: {
        size: 24,
        'aria-hidden': true,
        style: { flexShrink: 0 },
      },
    };
  }, [type]);

/**
 * 複数アイテムのメタデータを生成するヘルパー
 */
export const useItemMetadata = (
  item: Pick<RecycleBinItem, 'type' | 'boardTitle' | 'columnTitle' | 'columnsCount' | 'taskCount'>
) => useMemo(() => {
    const metadata: Array<{
      label: string;
      value: string | number;
      key: string;
    }> = [];

    switch (item.type) {
      case 'task':
        if (item.boardTitle) {
          metadata.push({
            label: '所属ボード',
            value: item.boardTitle,
            key: 'board',
          });
        }
        if (item.columnTitle) {
          metadata.push({
            label: '所属カラム',
            value: item.columnTitle,
            key: 'column',
          });
        }
        break;

      case 'column':
        if (item.boardTitle) {
          metadata.push({
            label: '所属ボード',
            value: item.boardTitle,
            key: 'board',
          });
        }
        if (typeof item.taskCount === 'number') {
          metadata.push({
            label: 'タスク数',
            value: `${item.taskCount}個`,
            key: 'taskCount',
          });
        }
        break;

      case 'board':
        if (typeof item.columnsCount === 'number') {
          metadata.push({
            label: 'カラム数',
            value: `${item.columnsCount}個`,
            key: 'columnsCount',
          });
        }
        if (typeof item.taskCount === 'number') {
          metadata.push({
            label: 'タスク数',
            value: `${item.taskCount}個`,
            key: 'taskCount',
          });
        }
        break;
    }

    return metadata;
  }, [item]);