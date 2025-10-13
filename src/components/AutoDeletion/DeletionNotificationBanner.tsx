import React, { useState, useCallback, useMemo } from "react";
import {
  Text,
  Button,
  Flash,
  ActionList,
  ActionMenu,
  Dialog,
} from "@primer/react";
import {
  AlertIcon,
  TrashIcon,
  EyeIcon,
  ClockIcon,
  XIcon,
} from "@primer/octicons-react";
import type { DeletionCandidate } from "../../types";
import { NotificationMessages, DateUtils } from "../../utils/deletionHelpers";
import { useBoard } from "../../contexts/BoardContext";

interface DeletionNotificationBannerProps {
  candidates: DeletionCandidate[];
  onDismiss?: () => void;
  className?: string;
}

export const DeletionNotificationBanner: React.FC<DeletionNotificationBannerProps> = ({
  candidates,
  onDismiss,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const { runManualDeletionCheck } = useBoard();

  const sortedCandidates = useMemo(() =>
    [...candidates].sort((a, b) => a.daysUntilDeletion - b.daysUntilDeletion)
  , [candidates]);

  const urgentCandidates = useMemo(() =>
    sortedCandidates.filter((c) => c.daysUntilDeletion <= 1)
  , [sortedCandidates]);

  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
    onDismiss?.();
  }, [onDismiss]);

  const handleRunDeletion = useCallback(async () => {
    await runManualDeletionCheck();
    setIsExpanded(false);
  }, [runManualDeletionCheck]);

  if (isDismissed || candidates.length === 0) {
    return null;
  }

  const warningMessage = NotificationMessages.getDeletionWarning(candidates);
  const isUrgent = urgentCandidates.length > 0;

  return (
    <>
      <Flash
        variant={isUrgent ? "danger" : "warning"}
        sx={{
          mb: 3,
          position: "relative",
        }}
        className={className}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <AlertIcon size={16} />
          <div style={{ flex: 1 }}>
            <Text sx={{ fontWeight: "bold" }}>
              {warningMessage}
            </Text>
            {isUrgent && (
              <Text sx={{ fontSize: 1, color: "fg.muted", mt: 1 }}>
                {urgentCandidates.length}件のタスクが緊急削除対象です
              </Text>
            )}
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <Button
              size="small"
              leadingVisual={EyeIcon}
              onClick={() => setShowDetailsDialog(true)}
            >
              詳細
            </Button>

            <ActionMenu>
              <ActionMenu.Button size="small">
                アクション
              </ActionMenu.Button>
              <ActionMenu.Overlay>
                <ActionList>
                  <ActionList.Item
                    variant="default"
                    onSelect={() => setIsExpanded(!isExpanded)}
                  >
                    <ActionList.LeadingVisual>
                      <ClockIcon />
                    </ActionList.LeadingVisual>
                    {isExpanded ? "概要を表示" : "詳細を表示"}
                  </ActionList.Item>
                  <ActionList.Divider />
                  <ActionList.Item
                    variant="danger"
                    onSelect={handleRunDeletion}
                  >
                    <ActionList.LeadingVisual>
                      <TrashIcon />
                    </ActionList.LeadingVisual>
                    今すぐ削除処理を実行
                  </ActionList.Item>
                </ActionList>
              </ActionMenu.Overlay>
            </ActionMenu>

            <Button
              variant="invisible"
              size="small"
              leadingVisual={XIcon}
              onClick={handleDismiss}
              aria-label="通知を閉じる"
            />
          </div>
        </div>

        {isExpanded && (
          <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid", borderColor: "var(--borderColor-muted)" }}>
            <Text sx={{ fontSize: 1, fontWeight: "bold", mb: 2 }}>
              削除予定タスク一覧:
            </Text>
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              {sortedCandidates.slice(0, 10).map((candidate) => (
                <div
                  key={candidate.task.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "4px 8px",
                    marginBottom: "4px",
                    background: "var(--bgColor-muted)",
                    borderRadius: "var(--borderRadius-small)",
                    fontSize: "14px",
                  }}
                >
                  <Text sx={{ fontWeight: "medium", flex: 1 }}>
                    {candidate.task.title}
                  </Text>
                  <Text
                    sx={{
                      color: candidate.daysUntilDeletion <= 1 ? "danger.fg" : "attention.fg",
                      fontWeight: "bold",
                    }}
                  >
                    {candidate.daysUntilDeletion <= 0
                      ? "削除予定"
                      : `${candidate.daysUntilDeletion}日後`}
                  </Text>
                </div>
              ))}
              {sortedCandidates.length > 10 && (
                <Text sx={{ fontSize: 1, color: "fg.muted", textAlign: "center", py: 2 }}>
                  他 {sortedCandidates.length - 10} 件...
                </Text>
              )}
            </div>
          </div>
        )}
      </Flash>

      {/* 詳細ダイアログ */}
      {showDetailsDialog && (
        <Dialog
          onClose={() => setShowDetailsDialog(false)}
          aria-labelledby="deletion-details-title"
        >
        <Dialog.Header id="deletion-details-title">
          削除予定タスクの詳細
        </Dialog.Header>
        <div style={{ padding: "12px" }}>
          <Text sx={{ mb: 3, color: "fg.muted" }}>
            以下のタスクが自動削除の対象となっています。
          </Text>

          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {sortedCandidates.map((candidate) => {
              const completedDate = candidate.task.completedAt
                ? new Date(candidate.task.completedAt)
                : null;

              return (
                <div
                  key={candidate.task.id}
                  style={{
                    padding: "12px",
                    marginBottom: "8px",
                    border: "1px solid",
                    borderColor: "var(--borderColor-default)",
                    borderRadius: "4px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
                    <Text sx={{ fontWeight: "bold", flex: 1 }}>
                      {candidate.task.title}
                    </Text>
                    <Text
                      sx={{
                        color: candidate.daysUntilDeletion <= 1 ? "danger.fg" : "attention.fg",
                        fontWeight: "bold",
                        fontSize: 1,
                      }}
                    >
                      {candidate.daysUntilDeletion <= 0
                        ? "削除予定"
                        : `${candidate.daysUntilDeletion}日後に削除`}
                    </Text>
                  </div>

                  {candidate.task.description && (
                    <Text sx={{ fontSize: 1, color: "fg.muted", mb: 2 }}>
                      {candidate.task.description.substring(0, 100)}
                      {candidate.task.description.length > 100 && "..."}
                    </Text>
                  )}

                  <div style={{ display: "flex", gap: "12px", fontSize: "14px", color: "var(--fgColor-muted)" }}>
                    <Text>
                      <strong>完了日:</strong>{" "}
                      {completedDate ? DateUtils.formatJapanese(completedDate) : "不明"}
                    </Text>
                    <Text>
                      <strong>ボード:</strong> {candidate.boardId}
                    </Text>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", padding: "12px" }}>
          <Button onClick={() => setShowDetailsDialog(false)}>
            閉じる
          </Button>
          <Button variant="primary" onClick={handleRunDeletion}>
            削除処理を実行
          </Button>
        </div>
        </Dialog>
      )}
    </>
  );
};

export default DeletionNotificationBanner;