import React from "react";
import {
  CheckCircleIcon,
  InfoIcon,
  AlertIcon,
  StopIcon,
} from "@primer/octicons-react";
import type { NotificationType } from "../types";

/**
 * 通知タイプに応じたアイコンを返す
 *
 * @param type - 通知のタイプ
 * @returns 対応するPrimer Reactアイコンコンポーネント
 */
export const getNotificationIcon = (type: NotificationType): React.ReactElement => {
  switch (type) {
    case "success":
      return <CheckCircleIcon size={16} aria-hidden="true" />;
    case "info":
      return <InfoIcon size={16} aria-hidden="true" />;
    case "warning":
      return <AlertIcon size={16} aria-hidden="true" />;
    case "error":
      return <StopIcon size={16} aria-hidden="true" />;
    default:
      return <InfoIcon size={16} aria-hidden="true" />;
  }
};

/**
 * 通知タイプに応じたPrimer Flash variantを返す
 *
 * @param type - 通知のタイプ
 * @returns Primer Flash componentに対応するvariant文字列
 */
export const getFlashVariant = (
  type: NotificationType,
): "default" | "warning" | "danger" | "success" => {
  switch (type) {
    case "success":
      return "success";
    case "warning":
      return "warning";
    case "error":
      return "danger";
    case "info":
    default:
      return "default";
  }
};