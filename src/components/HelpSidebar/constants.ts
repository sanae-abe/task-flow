import {
  type LucideIcon,
  List,
  Table,
  Calendar,
  Paperclip,
  Filter,
  FileText,
  Database,
  MousePointer,
  Info,
  Video,
} from 'lucide-react';

/**
 * ヘルプセクションの色定義
 */
export const SECTION_COLORS = {
  PRIMARY_BLUE: 'bg-primary', // ビュー切り替え、タスク管理
  SUCCESS_GREEN: 'bg-success', // 基本操作、便利なヒント
  ATTENTION_YELLOW: 'bg-warning', // ファイル添付
  ACCENT_PURPLE: 'bg-purple-600', // カレンダー機能
  DANGER_RED: 'bg-destructive', // フィルタリング・ソート
  MUTED_GRAY: 'bg-gray-600', // テンプレート管理
  SPONSOR_ORANGE: 'bg-orange-600', // データ管理
} as const;

/**
 * レイアウト定数
 */
export const SIDEBAR_WIDTH = 500;
export const SIDEBAR_Z_INDEX = 40;
export const TITLE_MIN_WIDTH = 120;

/**
 * ヘルプアイテムの型定義
 */
export interface HelpItemConfig {
  icon: LucideIcon;
  title: string;
  description: string;
}

/**
 * ヘルプセクションの型定義
 */
export interface HelpSectionConfig {
  title: string;
  color: (typeof SECTION_COLORS)[keyof typeof SECTION_COLORS];
  items: HelpItemConfig[];
}

/**
 * ヘルプセクション設定
 */
export const HELP_SECTIONS: HelpSectionConfig[] = [
  {
    title: 'ビュー切り替え',
    color: SECTION_COLORS.PRIMARY_BLUE,
    items: [
      {
        icon: List,
        title: 'カンバンビュー',
        description:
          'ドラッグ&ドロップでタスクを直感的に管理できます。カラム間でタスクを移動して、ステータスを変更できます。',
      },
      {
        icon: Table,
        title: 'テーブルビュー',
        description:
          '全タスクを一覧で確認できます。ソートやフィルタリングで効率的に管理できます。',
      },
      {
        icon: Calendar,
        title: 'カレンダービュー',
        description:
          '期限を基にタスクをカレンダー形式で表示します。月次での予定管理に最適です。',
      },
    ],
  },
  {
    title: '基本操作',
    color: SECTION_COLORS.SUCCESS_GREEN,
    items: [
      {
        icon: MousePointer,
        title: 'タスク作成',
        description:
          'ヘッダーの「+」ボタンまたはカンバンビューの「+タスク追加」からタスクを作成できます。',
      },
      {
        icon: MousePointer,
        title: 'タスク編集',
        description:
          'カンバンビューではカードをクリック、テーブルビューでは行をクリックで詳細を確認・編集できます。',
      },
      {
        icon: MousePointer,
        title: 'タスク削除',
        description:
          'タスク詳細画面またはテーブルビューのアクションメニューから削除できます。',
      },
    ],
  },
  {
    title: 'タスク管理機能',
    color: SECTION_COLORS.PRIMARY_BLUE,
    items: [
      {
        icon: Info,
        title: 'サブタスク',
        description:
          'タスク内にチェックリスト形式でサブタスクを追加できます。進捗が自動で計算されます。',
      },
      {
        icon: Info,
        title: 'ラベル機能',
        description:
          'カスタムカラーラベルでタスクを分類できます。複数のラベルを設定可能です。',
      },
      {
        icon: Info,
        title: '期限設定',
        description:
          '詳細な日時設定が可能です。時刻未設定の場合、デフォルトで23:59に設定されます。',
      },
      {
        icon: Info,
        title: '繰り返し設定',
        description:
          '毎日、毎週、毎月、毎年の自動再作成に対応。期限なし繰り返しも可能です。',
      },
    ],
  },
  {
    title: 'ファイル添付',
    color: SECTION_COLORS.ATTENTION_YELLOW,
    items: [
      {
        icon: Paperclip,
        title: 'ドラッグ&ドロップ',
        description:
          'ファイルをドラッグ&ドロップで簡単に添付できます（5MBまで）。',
      },
    ],
  },
  {
    title: 'カレンダー機能',
    color: SECTION_COLORS.ACCENT_PURPLE,
    items: [
      {
        icon: Calendar,
        title: '月次表示',
        description:
          '期限ベースでタスクをカレンダー表示。直接編集や詳細確認が可能です。',
      },
    ],
  },
  {
    title: 'フィルタリング・ソート',
    color: SECTION_COLORS.DANGER_RED,
    items: [
      {
        icon: Filter,
        title: '多角的なタスク整理',
        description:
          'ステータス、優先度、期限、ラベルなど、様々な条件でタスクをフィルタリング・ソートできます。',
      },
    ],
  },
  {
    title: 'テンプレート管理',
    color: SECTION_COLORS.MUTED_GRAY,
    items: [
      {
        icon: FileText,
        title: 'テンプレート作成',
        description:
          'よく使うタスクをテンプレートとして保存。カテゴリー分類やお気に入り機能で管理できます。',
      },
    ],
  },
  {
    title: 'カスタマイズ',
    color: SECTION_COLORS.PRIMARY_BLUE,
    items: [
      {
        icon: Table,
        title: 'テーブル表示項目',
        description:
          '12種類のカラムから表示項目を自由に選択できます。使いやすい形にカスタマイズしましょう。',
      },
    ],
  },
  {
    title: 'データ管理',
    color: SECTION_COLORS.SPONSOR_ORANGE,
    items: [
      {
        icon: Database,
        title: 'エクスポート・インポート',
        description:
          'タスクデータをJSON形式でエクスポート・インポートできます。データのバックアップや移行に便利です。',
      },
    ],
  },
  {
    title: '便利なヒント',
    color: SECTION_COLORS.SUCCESS_GREEN,
    items: [
      {
        icon: Video,
        title: 'キーボードショートカット',
        description: 'Enterキーでフォーム送信など、効率的な操作が可能です。',
      },
      {
        icon: Info,
        title: 'リッチテキストエディタ',
        description:
          'タスクの説明にはLexicalベースのリッチテキストエディタを使用。太字、斜体、リンク、コードブロック、絵文字などに対応しています。',
      },
    ],
  },
];
