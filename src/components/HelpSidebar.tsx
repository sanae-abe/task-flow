import { XIcon, CheckCircleIcon, PencilIcon, ArrowRightIcon, FilterIcon, UploadIcon } from '@primer/octicons-react';
import { Button, Box, Heading, Text } from '@primer/react';
import React, { useEffect } from 'react';

interface HelpSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HelpSectionProps {
  title: string;
  icon: React.ComponentType<{ size?: number }>;
  children: React.ReactNode;
}

const HelpSection: React.FC<HelpSectionProps> = ({ title, icon: Icon, children }) => (
  <Box sx={{ mb: 4 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
      <Icon size={16} />
      <Text sx={{ fontWeight: 'bold', fontSize: 1 }}>{title}</Text>
    </Box>
    <Box sx={{ pl: 3 }}>
      {children}
    </Box>
  </Box>
);

const HelpItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text sx={{ fontSize: 1, lineHeight: 1.5, mb: 2, display: 'block' }}>
    {children}
  </Text>
);

const HelpSidebar: React.FC<HelpSidebarProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <Box
      sx={{ 
        position: "fixed",
        top: 0,
        right: 0,
        width: "450px",
        height: "100vh",
        bg: "canvas.default",
        boxShadow: '0 16px 32px rgba(0, 0, 0, 0.24)',
        borderLeft: '1px solid',
        borderColor: 'border.default',
        zIndex: 1000,
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
          <Heading sx={{ fontSize: 2, margin: 0, pr: 3 }}>
            使い方ヘルプ
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
        <Box sx={{ flex: "1", p: 4, overflowY: 'auto' }}>
          <Text sx={{ fontSize: 1, mb: 4, color: 'fg.muted' }}>
            Offline Kanbanの基本的な使い方を説明します。
          </Text>

          <HelpSection title="基本操作" icon={CheckCircleIcon}>
            <HelpItem>
              • <strong>ボード作成</strong>: 「新しいボード」ボタンでプロジェクトボードを作成
            </HelpItem>
            <HelpItem>
              • <strong>カラム追加</strong>: サブヘッダーの「カラムを追加」ボタンで作業段階を追加
            </HelpItem>
            <HelpItem>
              • <strong>タスク作成</strong>: 各カラムの「+」ボタンでタスクを作成
            </HelpItem>
            <HelpItem>
              • <strong>ドラッグ&ドロップ</strong>: タスクをドラッグしてカラム間を移動
            </HelpItem>
          </HelpSection>

          <HelpSection title="タスク管理" icon={PencilIcon}>
            <HelpItem>
              • <strong>タスク編集</strong>: タスクカードをクリックして詳細表示・編集
            </HelpItem>
            <HelpItem>
              • <strong>完了機能</strong>: タスク名左のチェックアイコンで即座に完了状態に移動
            </HelpItem>
            <HelpItem>
              • <strong>サブタスク</strong>: タスク詳細画面でチェックリスト形式のサブタスクを管理
            </HelpItem>
            <HelpItem>
              • <strong>ラベル</strong>: 色付きラベルでタスクを分類・整理
            </HelpItem>
            <HelpItem>
              • <strong>期限設定</strong>: 日時指定で期限管理、期限切れタスクは自動警告
            </HelpItem>
          </HelpSection>

          <HelpSection title="ファイル添付" icon={UploadIcon}>
            <HelpItem>
              • <strong>ファイル添付</strong>: タスク作成・編集時にドラッグ&ドロップでファイル添付
            </HelpItem>
            <HelpItem>
              • <strong>プレビュー</strong>: 画像・テキストファイルはサイドバーでプレビュー表示
            </HelpItem>
            <HelpItem>
              • <strong>ダウンロード</strong>: 添付ファイルをクリックしてダウンロード
            </HelpItem>
          </HelpSection>

          <HelpSection title="フィルタリング・ソート" icon={FilterIcon}>
            <HelpItem>
              • <strong>タスクフィルタ</strong>: 期限・ラベル・完了状態でタスクを絞り込み
            </HelpItem>
            <HelpItem>
              • <strong>ソート機能</strong>: 作成日・更新日・期限・名前順でタスクを並び替え
            </HelpItem>
            <HelpItem>
              • <strong>統計表示</strong>: サブヘッダーで未完了タスク数・期限警告を確認
            </HelpItem>
          </HelpSection>

          <HelpSection title="データ管理" icon={ArrowRightIcon}>
            <HelpItem>
              • <strong>ローカル保存</strong>: すべてのデータはブラウザに自動保存
            </HelpItem>
            <HelpItem>
              • <strong>データインポート</strong>: JSONファイルでデータの一括インポート
            </HelpItem>
            <HelpItem>
              • <strong>完了タスククリア</strong>: ボード設定から完了タスクを一括削除
            </HelpItem>
          </HelpSection>

          <Box sx={{ 
            mt: 5, 
            p: 3, 
            bg: 'neutral.subtle', 
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'border.default'
          }}>
            <Text sx={{ fontSize: 1, fontWeight: 'bold', mb: 2 }}>
              💡 ヒント
            </Text>
            <Text sx={{ fontSize: 0, lineHeight: 1.4, color: 'fg.muted' }}>
              • Escapeキーでダイアログやサイドバーを閉じることができます<br />
              • 右端のカラムが「完了」状態として扱われます<br />
              • データはブラウザのローカルストレージに保存されるため、オフラインでも使用可能です
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default HelpSidebar;