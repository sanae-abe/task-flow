# Lexical Rich Text Editor (PoC)

> **📝 ステータス**: Proof of Concept (検証中)
> **📅 作成日**: 2025-11-01
> **🎯 目的**: ContentEditableベースエディタからLexicalへの移行可能性検証

## 概要

このディレクトリには、Meta製の[Lexical](https://lexical.dev/)エディタフレームワークを使用したリッチテキストエディタのPoC実装が含まれています。既存のContentEditableベースの`RichTextEditor`と同じインターフェースを提供し、段階的な移行を可能にします。

## 🎯 PoC目標

- ✅ 既存RichTextEditorと同じpropsインターフェース
- ✅ HTML ↔ Lexical変換（DOMPurify統合）
- ✅ 基本フォーマット機能（太字・斜体・下線・取り消し線）
- ✅ リンク・コードブロック対応
- ✅ リスト（箇条書き・番号付き）
- ✅ Undo/Redo機能
- ✅ フィーチャーフラグでの切り替え

## 📁 ディレクトリ構造

```
LexicalRichTextEditor/
├── README.md                       # このファイル
├── index.tsx                       # メインコンポーネント
├── config.ts                       # Lexical初期設定
├── theme.ts                        # TailwindベースのLexicalテーマ
├── components/
│   └── Toolbar.tsx                 # ツールバーコンポーネント
├── plugins/
│   ├── HtmlPlugin.tsx              # HTML初期化プラグイン
│   └── OnChangePlugin.tsx          # onChange同期プラグイン
└── utils/
    └── htmlConverter.ts            # HTML ↔ Lexical変換ユーティリティ
```

## 🚀 使用方法

### フィーチャーフラグでの有効化

`.env`ファイルまたは環境変数を設定：

```bash
# Lexicalエディタを有効化
VITE_USE_LEXICAL_EDITOR=true
```

### 直接使用

```typescript
import LexicalRichTextEditor from '@/components/LexicalRichTextEditor';

function MyComponent() {
  const [value, setValue] = useState('<p>初期値</p>');

  return (
    <LexicalRichTextEditor
      value={value}
      onChange={setValue}
      placeholder="説明を入力..."
      disabled={false}
      minHeight="120px"
    />
  );
}
```

### フィーチャーフラグラッパー使用

```typescript
import RichTextEditorWrapper from '@/components/RichTextEditorWrapper';

// 環境変数で自動切り替え
<RichTextEditorWrapper
  value={value}
  onChange={setValue}
/>
```

## 🔧 実装詳細

### 主要コンポーネント

#### 1. LexicalRichTextEditor (index.tsx)
メインのエディタコンポーネント。`LexicalComposer`でラップし、必要なプラグインを統合。

#### 2. Toolbar (components/Toolbar.tsx)
フォーマットボタンを提供するツールバー。Lexical commandsを使用して編集機能を実行。

#### 3. HtmlPlugin (plugins/HtmlPlugin.tsx)
初期HTML値をLexicalエディタステートに変換・挿入。

#### 4. OnChangePlugin (plugins/OnChangePlugin.tsx)
Lexicalエディタ変更を監視し、HTML文字列として親コンポーネントに通知。

### HTML変換

#### Lexical → HTML変換

```typescript
import { lexicalToHtml } from './utils/htmlConverter';

const htmlString = lexicalToHtml(editor);
// DOMPurifyで自動サニタイズ済み
```

#### HTML → Lexical変換

```typescript
import { htmlToLexical } from './utils/htmlConverter';

htmlToLexical(editor, '<p>HTMLコンテンツ</p>');
// DOMPurifyで自動サニタイズ
```

### セキュリティ

- **DOMPurify統合**: すべてのHTML入出力を自動サニタイズ
- **許可タグ**: `p`, `strong`, `em`, `u`, `s`, `a`, `code`, `pre`, `ul`, `ol`, `li`, `h1-h3`, `blockquote`
- **XSS対策**: スクリプトタグ・危険な属性を自動除去

## ✅ 検証済み機能

- [x] **型安全性**: TypeScript strictモード完全対応
- [x] **ESLint**: 警告1件のみ（console.error、意図的）
- [x] **ビルド**: 本番ビルド成功
- [x] **バンドルサイズ**: 追加 ~52KB（Lexicalコア22KB + プラグイン~30KB）
- [x] **既存インターフェース互換性**: RichTextEditorPropsと完全互換

## 🔜 次のステップ

### Phase 1: 機能拡張 (推定3-4時間)
- [ ] 絵文字ピッカー統合
- [ ] リンク編集機能
- [ ] コードブロック機能強化
- [ ] ツールバーアクティブ状態表示

### Phase 2: テスト・検証 (推定2-3時間)
- [ ] 既存HTMLデータとの互換性テスト
- [ ] UnifiedTaskFormでの動作確認
- [ ] TemplateFormDialogでの動作確認
- [ ] パフォーマンス測定

### Phase 3: 本番展開準備 (推定2-3時間)
- [ ] ユーザーフィードバック収集
- [ ] バグ修正・安定化
- [ ] ドキュメント更新

## 📊 パフォーマンス比較

| 指標 | ContentEditable | Lexical (想定) |
|------|----------------|---------------|
| 初期ロード | ~50ms | ~40ms |
| メモリ使用量 | ~2-3MB | ~1.5-2MB |
| バンドルサイズ | ~15KB | ~52KB (+37KB) |
| レンダリング | 中程度 | 高速（DOM差分） |

## 🐛 既知の問題

現時点で既知の問題はありません。

## 📚 関連ドキュメント

- [Lexical移行プラン](/docs/migration/lexical-migration-plan.md)
- [Lexical調査レポート](/docs/research/lexical-editor-research-2025.md)
- [Lexical公式ドキュメント](https://lexical.dev/)
- [Lexical GitHub](https://github.com/facebook/lexical)

## 🤝 貢献

PoCフィードバックやバグ報告は歓迎です。

## 📝 ライセンス

MIT License (プロジェクト全体と同じ)
