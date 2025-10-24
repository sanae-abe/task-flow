/**
 * DialogFlashMessageの使用例
 *
 * このファイルは実際には使用されませんが、
 * 新しいダイアログで DialogFlashMessage を使用する方法の例として提供されています。
 */

import React from 'react';
import { Button } from '@primer/react';
import { DialogFlashMessage, useDialogFlashMessage } from './index';

/**
 * DialogFlashMessage使用例コンポーネント
 */
const ExampleDialog: React.FC = () => {
  // フックを使用してメッセージ状態を管理
  const {
    message,
    handleMessage,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearMessage
  } = useDialogFlashMessage();

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* メッセージ表示エリア */}
      <DialogFlashMessage message={message} />

      {/* テストボタン群 */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant="primary"
          onClick={() => showSuccess('操作が成功しました')}
        >
          成功メッセージ
        </Button>

        <Button
          variant="primary"
          onClick={() => showSuccess('ファイルを正常に保存しました', '保存完了')}
        >
          タイトル付き成功
        </Button>

        <Button
          variant="danger"
          onClick={() => showError('エラーが発生しました')}
        >
          エラーメッセージ
        </Button>

        <Button
          variant="danger"
          onClick={() => showError('ファイルが見つかりません', 'ファイルエラー')}
        >
          タイトル付きエラー
        </Button>

        <Button
          variant="default"
          onClick={() => showWarning('注意が必要です')}
        >
          警告メッセージ
        </Button>

        <Button
          variant="default"
          onClick={() => showInfo('情報をお知らせします')}
        >
          情報メッセージ
        </Button>

        <Button
          variant="default"
          onClick={() => handleMessage({ type: 'upsell', text: 'アップグレードを検討してください', title: '機能制限' })}
        >
          タイトル付きアップセル
        </Button>

        <Button
          variant="invisible"
          onClick={clearMessage}
        >
          メッセージクリア
        </Button>
      </div>

      {/* 従来のonMessageコールバック形式での使用例 */}
      <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'var(--color-neutral-100)', borderRadius: '6px' }}>
        <h4>コールバック形式での使用例</h4>
        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
{`// 子コンポーネントに onMessage コールバックを渡す
<SomeChildComponent
  onMessage={handleMessage}
/>

// 子コンポーネント内で呼び出し（基本形）
onMessage?.({
  type: 'success',
  text: '処理が完了しました'
});

// タイトル付きメッセージ
onMessage?.({
  type: 'warning',
  title: '注意事項',
  text: 'この操作は元に戻せません'
});

// 便利メソッドの使用
showSuccess('保存しました');
showSuccess('保存しました', '完了');
showError('失敗しました', 'エラー');`}
        </pre>
      </div>
    </div>
  );
};

export default ExampleDialog;