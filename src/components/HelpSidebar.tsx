import {
  XIcon,
  DatabaseIcon,
  FilterIcon,
  InfoIcon,
  CalendarIcon,
  TableIcon,
  DeviceCameraVideoIcon,
  PencilIcon,
} from "@primer/octicons-react";
import { MousePointer, FileText, Paperclip } from "react-feather";

import { Button, Heading, Text } from "@primer/react";
import React, { useEffect, useCallback } from "react";

import Logo from "./Logo";

// 定数定義
const SIDEBAR_WIDTH = "440px";
const SIDEBAR_Z_INDEX = 1001;
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
  background = "var(--bgColor-accent-emphasis)",
}) => (
  <>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "12px",
      }}
    >
      <div
        style={{
          padding: "8px",
          background,
          borderRadius: "50%",
          color: "var(--fgColor-onEmphasis)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={14} />
      </div>
      <Heading
        sx={{ fontSize: 2, fontWeight: "600", color: "fg.default", margin: 0 }}
      >
        {title}
      </Heading>
    </div>
    <div
      style={{
        marginBottom: "20px",
        padding: "12px",
        backgroundColor: "var(--bgColor-muted)",
        borderRadius: "var(--borderRadius-medium)",
      }}
    >
      <div style={{ paddingLeft: 0 }}>{children}</div>
    </div>
  </>
);

interface HelpItemProps {
  title: string | React.ReactNode;
  description: string;
}

const HelpItem: React.FC<HelpItemProps> = ({ title, description }) => (
  <div
    style={{
      padding: "8px",
      backgroundColor: "var(--bgColor-muted)",
      borderRadius: "var(--borderRadius-medium)",
      display: "flex",
      gap: "12px",
      alignItems: "flex-start",
    }}
  >
    <Text
      sx={{
        fontSize: 1,
        fontWeight: "600",
        color: "accent.emphasis",
        minWidth: TITLE_MIN_WIDTH,
        flexShrink: 0,
        overflowWrap: "break-word",
      }}
    >
      {title}
    </Text>
    <Text
      sx={{
        fontSize: 0,
        lineHeight: 1.5,
        color: "fg.default",
        flex: 1,
      }}
    >
      {description}
    </Text>
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
        backgroundColor: "var(--bgColor-default)",
        boxShadow: "0 16px 32px rgba(0, 0, 0, 0.24)",
        borderLeft: "1px solid",
        borderColor: "var(--borderColor-default)",
        zIndex: SIDEBAR_Z_INDEX,
        overflowY: "auto",
        animation:
          "sidebar-slide-in-right 250ms cubic-bezier(0.33, 1, 0.68, 1)",
      }}
    >
      <div style={{ display: "flex", height: "100%", flexDirection: "column" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            padding: "17px 16px 16px",
            alignItems: "flex-start",
            justifyContent: "space-between",
            borderBottom: "1px solid",
            borderColor: "var(--borderColor-default)",
            flexShrink: 0,
          }}
        >
          <Heading
            id="help-title"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              fontSize: "1.25rem !important",
              "& svg": {
                color: "accent.emphasis",
                marginRight: "2px",
              },
            }}
          >
            <Logo />
            使い方ガイド
          </Heading>
          <Button
            onClick={onClose}
            variant="invisible"
            size="small"
            leadingVisual={XIcon}
            aria-label="ヘルプを閉じる"
            sx={{ flexShrink: 0 }}
          />
        </div>

        {/* Content */}
        <div style={{ flex: "1", padding: "16px", overflowY: "auto" }}>
          <HelpSection
            title="ビュー切り替え"
            icon={DeviceCameraVideoIcon}
            background="var(--bgColor-accent-emphasis)"
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
            background="var(--bgColor-success-emphasis)"
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
            icon={PencilIcon}
            background="var(--bgColor-accent-emphasis)"
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
              title={
                <>
                  リッチテキスト
                  <br />
                  エディタ
                </>
              }
              description="タスクの説明欄で豊富なフォーマット機能を使用可能。太字・斜体・下線・取り消し線・リンク・コード・コードブロック・絵文字に対応。キーボードショートカット：Ctrl+B（太字）、Ctrl+I（斜体）、Ctrl+U（下線）、Ctrl+Shift+X（取り消し線）、Ctrl+K（リンク）、Ctrl+`（コード）、Ctrl+Shift+`（コードブロック）。絵文字は😊ボタンから選択可能"
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
              title="期限設定"
              description="日時指定で期限管理、期限切れタスクは自動警告"
            />
            <HelpItem
              title="時刻設定"
              description="期限日に時刻を追加設定、デフォルトは23:59で詳細時刻管理が可能"
            />
            <HelpItem
              title="繰り返し設定"
              description="毎日・毎週・毎月・毎年の繰り返しパターンでタスクを自動再作成。期限の有無に関わらず設定可能で、期限なし繰り返しタスクは作成日を基準に自動生成"
            />
            <HelpItem
              title="優先度設定"
              description="Critical（緊急）・High（高）・Medium（中）・Low（低）の4段階で優先度を設定。優先度によるフィルタリング・ソート機能も利用可能"
            />
          </HelpSection>

          <HelpSection
            title="ファイル添付"
            icon={Paperclip}
            background="var(--bgColor-attention-emphasis)"
          >
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

          <HelpSection
            title="カレンダー機能"
            icon={CalendarIcon}
            background="var(--bgColor-done-emphasis)"
          >
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

          <HelpSection
            title="フィルタリング・ソート"
            icon={FilterIcon}
            background="var(--bgColor-severe-emphasis)"
          >
            <HelpItem
              title="タスクフィルタ"
              description="期限・ラベル・優先度・完了状態でタスクを絞り込み。優先度フィルターでは複数の優先度を同時選択可能"
            />
            <HelpItem
              title="ソート機能"
              description="作成日・更新日・期限・名前・優先度順でタスクを並び替え。優先度ソートは緊急→高→中→低→未設定の順"
            />
            <HelpItem
              title="統計表示"
              description="サブヘッダーで未完了タスク数・期限警告を確認"
            />
          </HelpSection>

          <HelpSection
            title="テンプレート管理"
            icon={FileText}
            background="var(--bgColor-closed-emphasis)"
          >
            <HelpItem
              title="テンプレート作成"
              description="設定画面のテンプレート管理から、繰り返し使用するタスクパターンをテンプレートとして保存。タスクタイトル・説明・優先度・ラベル等を事前定義"
            />
            <HelpItem
              title={
                <>
                  テンプレートから
                  <br />
                  タスク作成
                </>
              }
              description="タスク作成画面の「テンプレートから作成」タブで、保存済みテンプレートをワンクリックで選択してタスク作成"
            />
            <HelpItem
              title="カテゴリー管理"
              description="仕事・個人・プロジェクト・会議・ルーティン・その他の6つのカテゴリーでテンプレートを分類整理"
            />
            <HelpItem
              title="お気に入り機能"
              description="よく使用するテンプレートをお気に入りに登録。タスク作成時に優先表示され、使用統計も確認可能"
            />
            <HelpItem
              title="検索・フィルター"
              description="テンプレート名・説明・カテゴリーで検索、お気に入り・使用数・作成日時でソート可能"
            />
          </HelpSection>

          <HelpSection
            title="テーブルビューの詳細機能"
            icon={TableIcon}
            background="var(--bgColor-accent-emphasis)"
          >
            <HelpItem
              title="カラム管理"
              description="テーブル右上の設定ボタンから表示カラムの表示/非表示を切り替え"
            />
            <HelpItem
              title="利用可能なカラム"
              description="タスク名、ステータス、期限、ラベル、サブタスク、ファイル、進捗、作成日、更新日、完了日、説明、繰り返し設定"
            />
            <HelpItem
              title="タスク件数表示"
              description="タスク名カラムに現在表示中のタスク数をカウンター表示"
            />
            <HelpItem
              title="進捗表示"
              description="サブタスクの完了状況をプログレスバーと割合で視覚的に表示"
            />
          </HelpSection>

          <HelpSection
            title="データ管理"
            icon={DatabaseIcon}
            background="var(--bgColor-sponsors-emphasis)"
          >
            <HelpItem
              title="ローカル保存"
              description="すべてのデータはブラウザに自動保存"
            />
            <HelpItem
              title="データインポート"
              description="JSONファイルでデータの一括インポート"
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
              description="設定画面のラベル管理で全ボードのラベルを一覧表示。ラベル名・所属ボード・使用数でソート可能、新しいラベルの作成・編集・削除が可能"
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
              title="完了タスククリア"
              description="ボード設定から完了タスクを一括削除"
            />
            <HelpItem
              title="自動削除システム"
              description="設定画面の自動削除設定で、完了タスクを指定期間後に自動削除。保持期間（1-365日）・通知タイミング・ソフトデリート機能を設定可能"
            />
            <HelpItem
              title="ごみ箱機能"
              description="設定画面のごみ箱からソフトデリートされたタスクを管理。削除予定のタスクを復元したり、完全削除前に確認可能"
            />
            <HelpItem
              title={
                <>
                  テンプレート
                  <br />
                  インポート・
                  <br />
                  エクスポート
                </>
              }
              description="設定画面のテンプレート管理から、テンプレートデータのバックアップ・復元・他環境への移行が可能"
            />
          </HelpSection>

          <HelpSection
            title="便利なヒント"
            icon={InfoIcon}
            background="var(--bgColor-success-emphasis)"
          >
            <HelpItem
              title="キーボード操作"
              description="Escapeキーでダイアログやサイドバーを閉じる"
            />
            <HelpItem
              title="完了管理"
              description="右端のカラムが「完了」状態として自動処理"
            />
            <HelpItem
              title={
                <>
                  繰り返し設定の
                  <br />
                  柔軟性
                </>
              }
              description="繰り返し設定は期限の有無に関わらず利用可能。期限ありは期限日基準、期限なしは作成日基準で次回タスクを自動生成"
            />
            <HelpItem
              title="オフライン対応"
              description="データはブラウザに保存されオフラインでも使用可能"
            />
            <HelpItem
              title={
                <>
                  効率的な
                  <br />
                  タスク管理
                </>
              }
              description="タスク複製機能で類似タスクを素早く作成、サブタスクの並び替えで優先順位を調整、完了タスクは自動で上部に表示"
            />
            <HelpItem
              title={
                <>
                  テンプレート
                  <br />
                  活用術
                </>
              }
              description="よく使用するタスクパターンをテンプレート化することで作業効率大幅UP。お気に入り登録で優先表示、カテゴリー分けで整理"
            />
            <HelpItem
              title={
                <>
                  優先度と
                  <br />
                  フィルター
                </>
              }
              description="優先度設定で重要タスクを見える化、優先度フィルターで緊急タスクに集中、優先度ソートで効率的な作業順序を構築"
            />
            <HelpItem
              title="自動削除と整理"
              description="完了タスクの自動削除でワークスペースを常にクリーンに保持。ソフトデリート機能で誤削除対策、ごみ箱で削除前確認"
            />
          </HelpSection>
        </div>
      </div>
    </div>
  );
};

export default HelpSidebar;
