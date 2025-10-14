import { Button, FormControl, TextInput } from "@primer/react";
import React, { useState, useCallback, useMemo, useEffect } from "react";

import UnifiedDialog from "./shared/Dialog/UnifiedDialog";
import ErrorMessage from "./ErrorMessage";

interface LinkInsertDialogProps {
  isOpen: boolean;
  onInsert: (url: string, text?: string) => void;
  onCancel: () => void;
  initialUrl?: string;
  initialText?: string;
  title?: string;
}

// URL検証ヘルパー関数
const validateUrl = (url: string): boolean => {
  if (!url.trim()) {
    return false;
  }

  try {
    const fullUrl = url.startsWith("http") ? url : `https://${url}`;
    const urlObj = new URL(fullUrl);
    const hostname = urlObj.hostname.toLowerCase();

    // localhost と IPアドレスは許可
    if (hostname === "localhost" || /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
      return true;
    }

    // 一般的なTLD（トップレベルドメイン）チェック
    const tldPattern = /\.(com|org|net|edu|gov|mil|int|co|io|dev|app|tech|info|biz|name|pro|museum|aero|coop|jobs|travel|mobi|asia|cat|tel|xxx|post|geo|local|test|example|localhost|jp|us|uk|de|fr|ca|au|cn|ru|br|mx|in|it|es|nl|se|ch|at|be|dk|no|fi|ie|pt|pl|cz|hu|gr|il|tr|za|my|sg|th|tw|hk|kr|nz|ar|cl|pe|ve|ec|py|uy|bo|co|gf|gy|sr|fk|gs)$/i.test(hostname);

    // ドメインに少なくとも1つのドットがあり、有効なTLDを持つ
    return hostname.includes(".") && tldPattern;
  } catch {
    return false;
  }
};;

const LinkInsertDialog: React.FC<LinkInsertDialogProps> = ({
  isOpen,
  onInsert,
  onCancel,
  initialUrl = "",
  initialText = "",
  title = "リンクを挿入",
}) => {
  const [url, setUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  // ダイアログが開かれた時に初期値を設定
  useEffect(() => {
    if (isOpen) {
      setUrl(initialUrl);
      setLinkText(initialText);
    }
  }, [isOpen, initialUrl, initialText]);

  // URL検証結果をメモ化
  const isValidUrl = useMemo(() => validateUrl(url), [url]);

  const handleInsert = useCallback(() => {
    if (isValidUrl) {
      onInsert(url.trim(), linkText.trim() || undefined);
      setUrl("");
      setLinkText("");
    }
  }, [url, linkText, onInsert, isValidUrl]);

  const handleCancel = useCallback(() => {
    setUrl("");
    setLinkText("");
    onCancel();
  }, [onCancel]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && isValidUrl) {
        e.preventDefault();
        handleInsert();
      }
    },
    [handleInsert, isValidUrl],
  );

  return (
    <UnifiedDialog
      title={title}
      isOpen={isOpen}
      onClose={handleCancel}
      variant="modal"
      size="medium"
      hideFooter
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <FormControl>
          <FormControl.Label required>URL</FormControl.Label>
          <TextInput
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            onKeyDown={handleKeyPress}
            autoFocus
            sx={{
              width: "100%",
              ...(url &&
                !isValidUrl && {
                  borderColor: "danger.fg",
                  "&:focus": {
                    borderColor: "danger.fg",
                    boxShadow: "0 0 0 2px rgba(248, 81, 73, 0.3)",
                  },
                }),
            }}
          />
          {url && !isValidUrl && (
            <ErrorMessage error="有効なURLを入力してください" />
          )}
        </FormControl>

        <FormControl>
          <FormControl.Label>表示テキスト</FormControl.Label>
          <TextInput
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            placeholder="リンクテキスト（空の場合はURLを使用）"
            onKeyDown={handleKeyPress}
            sx={{ width: "100%" }}
          />
        </FormControl>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "8px",
        }}
      >
        <Button onClick={handleCancel} variant="default">
          キャンセル
        </Button>
        <Button onClick={handleInsert} variant="primary" disabled={!isValidUrl}>
          挿入
        </Button>
      </div>
    </UnifiedDialog>
  );
};

export default LinkInsertDialog;
