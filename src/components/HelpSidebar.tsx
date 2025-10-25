import {
  X,
  Database,
  Filter,
  Info,
  Calendar,
  Table,
  Video,
  List,
  Paperclip,
  MousePointer,
  FileText
} from "lucide-react";

import { Button } from "@/components/ui/button";
import React, { useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

import Logo from "./Logo";

// 定数定義
const SIDEBAR_WIDTH = "440px";
const SIDEBAR_Z_INDEX = 400;
const TITLE_MIN_WIDTH = "120px";

interface HelpSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HelpSectionProps {
  title: string;
  icon: React.ComponentType<{ size?: number }>;
  children: React.ReactNode;
  background?: string;
}

const HelpSection: React.FC<HelpSectionProps> = ({
  title,
  icon: Icon,
  children,
  background = "var(--primary)",
}) => (
  <>
    <div className="flex items-center gap-2 mb-3">
      <div
        style={{
          background
        }}
        className="p-2 flex items-center justify-center rounded-full text-white"
      >
        <Icon size={14} />
      </div>
      <h3 className="text-base font-semibold text-gray-900 m-0">
        {title}
      </h3>
    </div>
    <div className="mb-5 p-3 bg-neutral-100 rounded-md">
      <div className="pl-0">{children}</div>
    </div>
  </>
);

interface HelpItemProps {
  title: string | React.ReactNode;
  description: string;
}

const HelpItem: React.FC<HelpItemProps> = ({ title, description }) => (
  <div className="p-2 flex gap-3 items-start mb-2 bg-neutral-100 rounded-md">
    <span
      style={{ minWidth: TITLE_MIN_WIDTH }}
      className={cn(`text-sm font-semibold text-blue-700 flex-shrink-0 break-words`)}
    >
      {title}
    </span>
    <span className="text-xs leading-6 text-gray-900 flex-1">
      {description}
    </span>
  </div>
);

const HelpSidebar: React.FC<HelpSidebarProps> = ({ isOpen, onClose }) => {
  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("keydown", handleEscape);
      };
    }
    return undefined;
  }, [isOpen, handleEscape]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-title"
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: SIDEBAR_WIDTH,
        height: "100vh",
        backgroundColor: "hsl(var(--background))",
        boxShadow: "0 16px 32px rgba(0, 0, 0, 0.24)",
        borderLeft: "1px solid",
        borderColor: "hsl(var(--border))",
        zIndex: SIDEBAR_Z_INDEX,
        overflowY: "auto",
        animation:
          "sidebar-slide-in-right 250ms cubic-bezier(0.33, 1, 0.68, 1)",
      }}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border flex-shrink-0 pt-[17px] pb-4 px-4">
          <h1
            id="help-title"
            className="flex items-center gap-2 text-xl font-medium"
          >
            <Logo />
            使い方ガイド
          </h1>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            aria-label="ヘルプを閉じる"
            className="flex-shrink-0 p-1 h-auto min-w-0"
          >
            <X size={16} />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          <HelpSection
            title="ビュー切り替え"
            icon={Video}
            background="var(--primary)"
          >
            <HelpItem
              title="カンバンビュー"
              description="カラム単位でタスクを管理するプロジェクト管理方式"
            />
            <HelpItem
              title="カレンダービュー"
              description="期限日ベースでタスクを月次カレンダー表示"
            />
            <HelpItem
              title="テーブルビュー"
              description="全タスクを一覧表形式で表示・管理、カラム表示のカスタマイズが可能"
            />
            <HelpItem
              title="切り替え方法"
              description="サブヘッダー右端のメニューからビューを選択"
            />
          </HelpSection>

          <HelpSection
            title="基本操作"
            icon={MousePointer}
            background="rgb(45 164 78)"
          >
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
              description="ヘッダーの「タスク作成」ボタンまたは各カラムの「+」ボタンでタスクを作成"
            />
            <HelpItem
              title={
                <>
                  ドラッグ&
                  <br />
                  ドロップ
                </>
              }
              description="タスクをドラッグしてカラム間を移動（カンバンビューで直感的操作）"
            />
            <HelpItem
              title="カラム移動"
              description="カラムヘッダーのkebabアイコン（⋯）から「左に移動」「右に移動」でカラムの順序変更が可能"
            />
          </HelpSection>

          <HelpSection
            title="タスク管理"
            icon={List}
            background="var(--primary)"
          >
            <HelpItem
              title="タスク編集"
              description="タスクカードをクリックして詳細表示・編集"
            />
            <HelpItem
              title="タスク複製"
              description="タスク詳細サイドバーの複製ボタンで既存タスクを同じカラムに複製。タイトルに「(コピー)」が付与され、サブタスクも未完了状態で複製される"
            />
            <HelpItem
              title="説明欄エディタ"
              description="タスク説明欄で太字・斜体・リンク・絵文字などの書式設定が可能"
            />
            <HelpItem
              title="完了機能"
              description="タスク名左のチェックアイコンで即座に完了状態に移動。完了したタスクは完了カラムの一番上に配置される"
            />
            <HelpItem
              title="サブタスク"
              description="タスク詳細画面でチェックリスト形式のサブタスクを管理。ドラッグハンドル（⋮⋮）をドラッグして順序変更が可能"
            />
            <HelpItem
              title="ラベル"
              description="色付きラベルでタスクを分類・整理"
            />
            <HelpItem
              title="期限・繰り返し設定"
              description="期限日時の設定と毎日・毎週・毎月・毎年の繰り返しパターンを設定。期限切れタスクは自動警告"
            />
            <HelpItem
              title="優先度設定"
              description="Critical（緊急）・High（高）・Medium（中）・Low（低）の4段階で優先度を設定。優先度によるフィルタリング・ソート機能も利用可能"
            />
          </HelpSection>

          <HelpSection
            title="ファイル添付"
            icon={Paperclip}
            background="rgb(212 167 44)"
          >
            <HelpItem
              title="ファイル管理"
              description="ドラッグ&ドロップでファイル添付、画像・テキストのプレビュー表示、ダウンロード機能"
            />
          </HelpSection>

          <HelpSection
            title="カレンダー機能"
            icon={Calendar}
            background="rgb(130 80 223)"
          >
            <HelpItem
              title="月次表示"
              description="期限日のあるタスクを月単位のカレンダーで表示、タスクをクリックして詳細確認・編集"
            />
          </HelpSection>

          <HelpSection
            title="フィルタリング・ソート"
            icon={Filter}
            background="rgb(218 54 51)"
          >
            <HelpItem
              title="絞り込み・並び替え"
              description="期限・ラベル・優先度・完了状態でフィルタ、作成日・更新日・期限・名前・優先度順でソート可能"
            />
          </HelpSection>

          <HelpSection
            title="テンプレート管理"
            icon={FileText}
            background="rgb(101 109 118)"
          >
            <HelpItem
              title="テンプレート機能"
              description="よく使うタスクパターンをテンプレートとして保存・管理。カテゴリー分類、お気に入り登録、検索機能で効率的に活用"
            />
          </HelpSection>

          <HelpSection
            title="テーブルビュー"
            icon={Table}
            background="var(--primary)"
          >
            <HelpItem
              title="カラム管理"
              description="右上の設定ボタンから表示項目をカスタマイズ、タスク数・進捗状況を一覧表示"
            />
          </HelpSection>

          <HelpSection
            title="データ管理"
            icon={Database}
            background="rgb(219 109 40)"
          >
            <HelpItem
              title="ローカル保存"
              description="すべてのデータはブラウザに自動保存"
            />
            <HelpItem
              title="データインポート"
              description="JSONファイルでデータの一括インポート。インポート結果・エラー情報は設定画面上部にメッセージで表示"
            />
            <HelpItem
              title={
                <>
                  ボード選択
                  <br />
                  エクスポート
                </>
              }
              description="設定画面のデータ管理から、任意のボードを選択してJSONファイルとしてエクスポート"
            />
            <HelpItem
              title="ラベル管理"
              description="設定画面のラベル管理で全ボードのラベルを一覧表示。ラベル名・所属ボード・使用数でソート可能、新しいラベルの作成・編集・削除が可能。操作結果は設定画面上部にメッセージで表示"
            />
            <HelpItem
              title={
                <>
                  デフォルト
                  <br />
                  カラム設定
                </>
              }
              description="設定画面のカンバン設定で、新しいボード作成時に使用されるデフォルトカラムを設定。カラム名の編集・追加・削除・順序変更（ドラッグ&ドロップ対応）が可能"
            />
            <HelpItem
              title="管理機能"
              description="ごみ箱でのタスク復元、完了タスククリア、テンプレートのバックアップ・復元が可能"
            />
          </HelpSection>

          <HelpSection
            title="便利なヒント"
            icon={Info}
            background="rgb(45 164 78)"
          >
            <HelpItem
              title="キーボード操作"
              description="Escapeキーでダイアログやサイドバーを閉じる"
            />
            <HelpItem
              title="オフライン対応"
              description="データはブラウザに保存されオフラインでも使用可能"
            />
            <HelpItem
              title="効率化のコツ"
              description="テンプレート機能、タスク複製、優先度フィルターを活用して作業効率をアップ"
            />
          </HelpSection>
        </div>
      </div>
    </div>
  );
};

export default HelpSidebar;
