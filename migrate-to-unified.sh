#!/bin/bash

# 残りのコンポーネントをUnifiedDialogに移行するスクリプト

COMPONENTS=(
  "TaskCreateDialog.tsx"
  "TaskEditDialog.tsx"
  "TimeSelectorDialog.tsx"
  "RecurrenceDetailDialog.tsx"
  "LabelAddDialog.tsx"
  "DataImportDialog.tsx"
)

echo "🚀 UnifiedDialog移行開始..."

for component in "${COMPONENTS[@]}"; do
  echo "📝 移行中: $component"

  file="src/components/$component"

  # CommonDialogCompatをUnifiedDialogに変更
  sed -i.bak 's/import CommonDialogCompat from/import UnifiedDialog from/' "$file"
  sed -i.bak 's|CommonDialogCompat|UnifiedDialog|g' "$file"

  # UnifiedDialogのパスを修正
  sed -i.bak 's|UnifiedDialog from '\''\.\/shared\/Dialog\/UnifiedDialog'\'';|UnifiedDialog from '\''\.\/shared\/Dialog\/UnifiedDialog'\'';|' "$file"

  # variant="modal"を追加し、hideFooter=trueをカスタムアクションのファイルに追加
  if [[ "$component" == "TaskEditDialog.tsx" || "$component" == "DataImportDialog.tsx" ]]; then
    # カスタムアクションパターン
    sed -i.bak 's/<UnifiedDialog/<UnifiedDialog\n      variant="modal"\n      hideFooter={true}/' "$file"
  else
    # DialogActionsパターン - variant="modal"のみ追加
    sed -i.bak 's/<UnifiedDialog/<UnifiedDialog\n      variant="modal"/' "$file"
  fi

  echo "✅ 完了: $component"
done

echo "🎉 一括移行完了！"