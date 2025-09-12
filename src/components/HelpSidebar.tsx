import { XIcon, CheckCircleIcon, PencilIcon, ArrowRightIcon, FilterIcon, UploadIcon, InfoIcon, CloudOfflineIcon, CalendarIcon } from '@primer/octicons-react';
import { Button, Box, Heading, Text } from '@primer/react';
import React, { useEffect, useCallback } from 'react';

// 定数定義
const SIDEBAR_WIDTH = '440px';
const SIDEBAR_Z_INDEX = 1000;
const TITLE_MIN_WIDTH = '120px';

interface HelpSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HelpSectionProps {
  title: string;
  icon: React.ComponentType<{ size?: number }>;
  children: React.ReactNode;
  color?: string;
}

const HelpSection: React.FC<HelpSectionProps> = ({ title, icon: Icon, children, color = 'accent.emphasis' }) => (
  <>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
      <Box sx={{
        p: 2,
        bg: color,
        borderRadius: '50%',
        color: 'fg.onEmphasis',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Icon size={14} />
      </Box>
      <Heading sx={{ fontSize: 2, fontWeight: 'bold', color: 'fg.default', margin: 0 }}>
        {title}
      </Heading>
    </Box>
    <Box sx={{
      mb: 5,
      p: 3,
      bg: 'canvas.subtle',
      borderRadius: '6px'
    }}>
      <Box sx={{ pl: 0 }}>
        {children}
      </Box>
    </Box>
  </>
);

interface HelpItemProps {
  title: string;
  description: string;
  highlight?: boolean;
}

const HelpItem: React.FC<HelpItemProps> = ({ title, description, highlight = false }) => (
  <Box sx={{
    p: 2,
    bg: highlight ? 'attention.subtle' : 'transparent',
    borderRadius: '6px',
    borderLeft: highlight ? '3px solid' : 'none',
    borderColor: highlight ? 'attention.emphasis' : 'transparent',
    display: 'flex',
    gap: 3,
    alignItems: 'flex-start'
  }}>
    <Text sx={{
      fontSize: 1,
      fontWeight: 'bold',
      color: 'accent.emphasis',
      minWidth: TITLE_MIN_WIDTH,
      flexShrink: 0,
      overflowWrap: 'break-word'
    }}>
      {title}
    </Text>
    <Text sx={{
      fontSize: 1,
      lineHeight: 1.5,
      color: 'fg.default',
      flex: 1
    }}>
      {description}
    </Text>
  </Box>
);

const HelpSidebar: React.FC<HelpSidebarProps> = ({ isOpen, onClose }) => {
  const handleEscape = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
    return undefined;
  }, [isOpen, handleEscape]);

  if (!isOpen) {
    return null;
  }

  return (
    <Box
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-title"
      sx={{
        position: "fixed",
        top: 0,
        right: 0,
        width: SIDEBAR_WIDTH,
        height: "100vh",
        bg: "canvas.default",
        boxShadow: '0 16px 32px rgba(0, 0, 0, 0.24)',
        borderLeft: '1px solid',
        borderColor: 'border.default',
        zIndex: SIDEBAR_Z_INDEX,
        overflowY: 'auto'
      }}
    >
      <Box sx={{ display: "flex", height: "100%", flexDirection: "column" }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            p: 4,
            alignItems: "flex-start",
            justifyContent: "space-between",
            borderBottom: "1px solid",
            borderColor: "border.default",
            flexShrink: 0
          }}
        >
            <Heading id="help-title" sx={{
                fontSize: '1.25rem !important',
              '& svg': {
                color: 'accent.emphasis', marginRight: '2px'
              } }}
            >
            <CloudOfflineIcon size={20} /> ToDo 使い方ガイド
          </Heading>
          <Button
            onClick={onClose}
            variant="invisible"
            size="small"
            leadingVisual={XIcon}
            aria-label="ヘルプを閉じる"
            sx={{ flexShrink: 0 }}
          />
        </Box>

        {/* Content */}
        <Box sx={{ flex: "1", p: 3, overflowY: 'auto' }}>

          <HelpSection title="ビュー切り替え" icon={CalendarIcon} color="accent.emphasis">
            <HelpItem
              title="カンバンビュー"
              description="カラム単位でタスクを管理するプロジェクト管理方式"
            />
            <HelpItem
              title="カレンダービュー"
              description="期限日ベースでタスクを月次カレンダー表示"
            />
            <HelpItem
              title="切り替え方法"
              description="サブヘッダー右端のメニューからビューを選択"
            />
          </HelpSection>

          <HelpSection title="基本操作" icon={CheckCircleIcon} color="success.emphasis">
            <HelpItem
              title="ボード作成"
              description="サブヘッダーの「ボード作成」ボタンでプロジェクトボードを作成"
            />
            <HelpItem
              title="カラム追加"
              description="サブヘッダーの「カラムを追加」ボタンで作業段階を追加（カンバンビュー時）"
            />
            <HelpItem
              title="タスク作成"
              description="ヘッダーの「タスク追加」ボタンまたは各カラムの「+」ボタンでタスクを作成"
            />
            <HelpItem
              title="ドラッグ&ドロップ"
              description="タスクをドラッグしてカラム間を移動（カンバンビューで直感的操作）"
            />
          </HelpSection>

          <HelpSection title="タスク管理" icon={PencilIcon} color="accent.emphasis">
            <HelpItem
              title="タスク編集"
              description="タスクカードをクリックして詳細表示・編集"
            />
            <HelpItem
              title="完了機能"
              description="タスク名左のチェックアイコンで即座に完了状態に移動"
            />
            <HelpItem
              title="サブタスク"
              description="タスク詳細画面でチェックリスト形式のサブタスクを管理"
            />
            <HelpItem
              title="ラベル"
              description="色付きラベルでタスクを分類・整理"
            />
            <HelpItem
              title="期限設定"
              description="日時指定で期限管理、期限切れタスクは自動警告"
            />
          </HelpSection>

          <HelpSection title="ファイル添付" icon={UploadIcon} color="attention.emphasis">
            <HelpItem
              title="ファイル添付"
              description="タスク作成・編集時にドラッグ&ドロップでファイル添付"
            />
            <HelpItem
              title="プレビュー"
              description="画像・テキストファイルはサイドバーでプレビュー表示"
            />
            <HelpItem
              title="ダウンロード"
              description="添付ファイルをクリックしてダウンロード"
            />
          </HelpSection>

          <HelpSection title="カレンダー機能" icon={CalendarIcon} color="done.emphasis">
            <HelpItem
              title="月次表示"
              description="期限日のあるタスクを月単位のカレンダーで表示"
            />
            <HelpItem
              title="ナビゲーション"
              description="前月・次月・今日ボタンで日付移動"
            />
            <HelpItem
              title="タスク表示"
              description="各日に最大3タスク表示、4つ目以降は「+N」で表示"
            />
            <HelpItem
              title="タスククリック"
              description="カレンダー上のタスクをクリックして詳細サイドバー表示"
            />
          </HelpSection>

          <HelpSection title="フィルタリング・ソート" icon={FilterIcon} color="severe.emphasis">
            <HelpItem
              title="タスクフィルタ"
              description="期限・ラベル・完了状態でタスクを絞り込み（カンバンビュー）"
            />
            <HelpItem
              title="ソート機能"
              description="作成日・更新日・期限・名前順でタスクを並び替え"
            />
            <HelpItem
              title="統計表示"
              description="サブヘッダーで未完了タスク数・期限警告を確認"
            />
          </HelpSection>

          <HelpSection title="データ管理" icon={ArrowRightIcon} color="sponsors.emphasis">
            <HelpItem
              title="ローカル保存"
              description="すべてのデータはブラウザに自動保存"
            />
            <HelpItem
              title="データインポート"
              description="JSONファイルでデータの一括インポート"
            />
            <HelpItem
              title="完了タスククリア"
              description="ボード設定から完了タスクを一括削除"
            />
          </HelpSection>

          <HelpSection title="便利なヒント" icon={InfoIcon} color="danger.emphasis">
            <HelpItem
              title="キーボード操作"
              description="Escapeキーでダイアログやサイドバーを閉じる"
            />
            <HelpItem
              title="完了管理"
              description="右端のカラムが「完了」状態として自動処理"
            />
            <HelpItem
              title="オフライン対応"
              description="データはブラウザに保存されオフラインでも使用可能"
            />
          </HelpSection>
        </Box>
      </Box>
    </Box>
  );
};

export default HelpSidebar;