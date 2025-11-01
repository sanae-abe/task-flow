# Lexical Editor Migration Plan

> **📋 文書情報**
> - 作成日: 2025-11-01
> - 対象: TaskFlowアプリケーションのRichTextEditor
> - 目的: ContentEditableベースからLexicalエディタへの移行計画

## 📊 Executive Summary

現在のTaskFlowアプリケーションはContentEditableベースのカスタムRichTextEditorを使用していますが、Lexical 0.35.0の依存関係が既にインストール済みです。本文書では、段階的で安全なLexicalエディタへの移行プランを策定します。

**推定工数**: 20-31時間（1-2週間）
**リスクレベル**: 🟡 中リスク（適切な軽減策あり）
**推奨度**: 中（機能拡張・技術負債解消目的）

## 🔍 現状分析

### 現在のRichTextEditor実装
- **アーキテクチャ**: ContentEditableベースのカスタム実装
- **ファイル構成**: 12モジュール分割（hooks, components, utils, types）
- **機能**: 太字・斜体・下線・取り消し線・リンク・コードブロック・絵文字ピッカー
- **使用箇所**: `UnifiedTaskForm.tsx`, `TemplateFormDialog.tsx`
- **セキュリティ**: DOMPurify統合済みでHTMLサニタイズ対応

### Lexical依存関係
```json
{
  "@lexical/html": "^0.35.0",
  "@lexical/link": "^0.35.0",
  "@lexical/list": "^0.35.0",
  "@lexical/plain-text": "^0.35.0",
  "@lexical/react": "^0.35.0",
  "@lexical/rich-text": "^0.35.0",
  "@lexical/selection": "^0.35.0",
  "@lexical/utils": "^0.35.0",
  "lexical": "^0.35.0"
}
```

## 🛡️ リスク評価

### セキュリティリスク 🔒
- **🟡 中リスク**: 既存のHTMLサニタイズ機能の移行（DOMPurify統合が必要）
- **軽減策**: Lexical標準のHTMLパーサーとDOMPurifyの組み合わせ

### 技術的リスク ⚙️
- **🟡 中リスク**: 破綻的変更、既存データの互換性問題
- **軽減策**: 段階的移行、データ変換レイヤー、rollback戦略

### 開発効率リスク 📊
- **🟡 中リスク**: 学習コスト、実装工数増加（推定20-30時間）
- **軽減策**: PoC作成、段階実装、既存機能の部分的置き換え

## ⚖️ メリット・デメリット比較

| 項目 | 現在（ContentEditable） | Lexical移行後 |
|------|------------------------|---------------|
| **パフォーマンス** | 🟡 中程度 | 🟢 高性能・最適化済み |
| **保守性** | 🟡 カスタム実装で複雑 | 🟢 標準化・コミュニティサポート |
| **機能拡張性** | 🔴 手動実装必要 | 🟢 プラグインエコシステム |
| **ブラウザ互換性** | 🟡 execCommand依存 | 🟢 モダンブラウザ最適化 |
| **TypeScript型安全性** | 🟡 部分的 | 🟢 完全型安全 |
| **実装コスト** | ✅ 実装済み | 🔴 20-30時間必要 |
| **学習コスト** | ✅ 不要 | 🟡 中程度 |

## 🏗️ 段階的移行戦略

### Phase 1: 準備・PoC（5-8時間）
- Lexical環境確認・設定
- 基本Lexicalエディタの作成
- 既存機能の一部実装確認
- データ変換テスト

### Phase 2: 新エディタ実装（10-15時間）
- LexicalRichTextEditor コンポーネント作成
- 必要なプラグイン統合
- 既存機能の完全移植
- スタイル適用

### Phase 3: 統合・テスト（3-5時間）
- フィーチャーフラグでの切り替え対応
- 既存データ互換性確認
- 段階的置き換え

### Phase 4: 最適化・改善（2-3時間）
- パフォーマンス最適化
- 旧実装削除
- ドキュメント更新

## 📝 詳細実装タスク

### 🎯 Phase 1: 準備・PoC作成（推定5-8時間）

#### 1.1 環境準備（1時間）
- [ ] Lexical設定ファイル作成（EditorConfig, Theme）
- [ ] TypeScript型定義整備
- [ ] 開発用ユーティリティ作成

#### 1.2 基本エディタPoC（2-3時間）
- [ ] `LexicalRichTextEditor`基本コンポーネント作成
- [ ] LexicalComposer初期設定
- [ ] RichTextPlugin, PlainTextPlugin統合
- [ ] 基本的なフォーマットボタン（Bold, Italic）

#### 1.3 データ変換テスト（2-3時間）
- [ ] HTML ↔ Lexical エディタ状態変換
- [ ] 既存HTMLデータの読み込みテスト
- [ ] DOMPurifyとの統合確認

#### 1.4 互換性確認（1-2時間）
- [ ] 既存データの表示確認
- [ ] タスク・テンプレートでの動作確認

### 🔧 Phase 2: 新エディタ実装（推定10-15時間）

#### 2.1 コンポーネント基盤（3-4時間）
- [ ] `src/components/LexicalRichTextEditor/` ディレクトリ作成
- [ ] エディタコンポーネント本体
- [ ] ツールバーコンポーネント
- [ ] プラグイン管理システム

#### 2.2 フォーマット機能（3-4時間）
- [ ] **太字・斜体・下線・取り消し線**プラグイン
- [ ] **リスト（ul/ol）**プラグイン
- [ ] **フォーマット削除**機能
- [ ] キーボードショートカット対応

#### 2.3 高度な機能（3-4時間）
- [ ] **リンク挿入・編集**プラグイン
- [ ] **コードブロック・インラインコード**プラグイン
- [ ] **絵文字ピッカー**統合
- [ ] **ペースト処理**カスタマイズ

#### 2.4 スタイル・UI（1-2時間）
- [ ] Tailwind CSS統合
- [ ] 既存デザインシステム適用
- [ ] ダークモード対応
- [ ] レスポンシブ対応

### 🔄 Phase 3: 統合・段階的移行（推定3-5時間）

#### 3.1 フィーチャーフラグ実装（1-2時間）
- [ ] 環境変数での新旧エディタ切り替え
- [ ] 開発者向けの切り替えUI
- [ ] A/Bテスト準備

#### 3.2 統合テスト（1-2時間）
- [ ] UnifiedTaskFormでの動作確認
- [ ] TemplateFormDialogでの動作確認
- [ ] 既存データの互換性テスト

#### 3.3 段階的置き換え（1時間）
- [ ] デフォルトをLexicalに変更
- [ ] 旧実装のバックアップ保持
- [ ] ロールバック手順確立

### ⚡ Phase 4: 最適化・クリーンアップ（推定2-3時間）

#### 4.1 パフォーマンス最適化（1-2時間）
- [ ] エディタ初期化最適化
- [ ] レンダリング最適化
- [ ] バンドルサイズ最適化

#### 4.2 旧実装削除（1時間）
- [ ] 旧RichTextEditorコンポーネント削除
- [ ] 不要ファイル・依存関係削除
- [ ] ドキュメント更新

## 🚀 移行の判断基準

### ✅ 移行を推奨する場合
- **機能拡張予定**がある（表、画像、協業機能等）
- **パフォーマンス改善**が必要
- **長期メンテナンス**を重視
- **モダンな開発体験**を重視

### ⚠️ 現状維持を推奨する場合
- **開発リソースが限られている**
- **現在の機能で十分**
- **リリース直前で安定性重視**
- **既存実装に満足している**

## 📊 工数見積もり

| Phase | 作業内容 | 推定時間 | 重要度 |
|-------|----------|----------|--------|
| Phase 1 | 準備・PoC作成 | 5-8時間 | 🔴 必須 |
| Phase 2 | 新エディタ実装 | 10-15時間 | 🔴 必須 |
| Phase 3 | 統合・移行 | 3-5時間 | 🔴 必須 |
| Phase 4 | 最適化・クリーンアップ | 2-3時間 | 🟡 推奨 |
| **合計** | **全体移行** | **20-31時間** | - |

**期間**: 1-2週間（1日4-6時間作業）
**優先度**: 中（機能改善・技術的負債解消）

## 💡 実装開始手順

### 🎯 Phase 1から開始
```bash
# 1. PoC用ブランチ作成
git checkout -b feature/lexical-migration-poc

# 2. 基本Lexicalエディタ作成
mkdir src/components/LexicalRichTextEditor
touch src/components/LexicalRichTextEditor/index.tsx

# 3. 設定ファイル準備
touch src/components/LexicalRichTextEditor/config.ts
touch src/components/LexicalRichTextEditor/theme.ts
```

### 🔄 フィーチャーフラグ実装例
```typescript
// 環境変数での切り替え
const USE_LEXICAL_EDITOR = process.env.REACT_APP_USE_LEXICAL === 'true';

// コンポーネントでの分岐
const RichTextEditor = USE_LEXICAL_EDITOR
  ? LexicalRichTextEditor
  : ContentEditableRichTextEditor;
```

### 📋 データ互換性戦略
```typescript
// HTML → Lexical変換
const htmlToLexical = (html: string) => {
  // DOMPurifyでサニタイズ
  const cleanHtml = DOMPurify.sanitize(html);
  // Lexical形式に変換
  return $generateNodesFromDOM(editor, dom);
};

// Lexical → HTML変換
const lexicalToHtml = (editorState: EditorState) => {
  return $generateHtmlFromNodes(editor, null);
};
```

## 🔗 関連ドキュメント

- [Lexical公式ドキュメント](https://lexical.dev/)
- [TaskFlow開発ガイド](../development/component-guide.md)
- [RichTextEditorアーキテクチャ](../architecture/rich-text-editor.md)

## 📞 サポート・質問

移行作業中に技術的な問題が発生した場合：

1. **Claude Codeコマンド**: `/feature Lexical移行` で体系的サポート
2. **デバッグコマンド**: `/debug [症状]` で問題解決
3. **技術調査**: `/research Lexical` で追加情報収集

---

**次のアクション**: Phase 1のPoC作成から開始し、フィーチャーフラグでの段階的移行を推奨します。