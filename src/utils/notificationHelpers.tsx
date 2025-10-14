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
export const getNotificationIcon = (
  type: NotificationType,
): React.ReactElement => {
  switch (type) {
    case "success":
      return <CheckCircleIcon size={16} aria-hidden="true" />;
    case "info":
      return <InfoIcon size={16} aria-hidden="true" />;
    case "warning":
      return <AlertIcon size={16} aria-hidden="true" />;
    case "critical":
      return <StopIcon size={16} aria-hidden="true" />;
    case "upsell":
      return <InfoIcon size={16} aria-hidden="true" />;
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
    case "critical":
      return "danger";
    case "info":
    case "upsell":
    default:
      return "default";
  }
};

/**
 * 通知タイプに応じたPrimer Banner variantを返す
 *
 * @param type - 通知のタイプ
 * @returns Primer Banner componentに対応するvariant文字列
 */
export const getBannerVariant = (
  type: NotificationType,
): "info" | "warning" | "critical" | "success" => {
  switch (type) {
    case "success":
      return "success";
    case "warning":
      return "warning";
    case "critical":
      return "critical";
    case "info":
    case "upsell":
    default:
      return "info";
  }
};
