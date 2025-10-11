import { XIcon } from "@primer/octicons-react";
import { Box, Text } from "@primer/react";
import { memo, useCallback, useMemo } from "react";

import type { Label } from "../types";
import { getLabelColors } from "../utils/labelHelpers";
import IconButton from "./shared/IconButton";

interface LabelChipProps {
  label: Label;
  showRemove?: boolean;
  onRemove?: (labelId: string) => void;
  onClick?: () => void;
  clickable?: boolean;
}

const LabelChip = memo<LabelChipProps>(
  ({ label, showRemove = false, onRemove, onClick, clickable = false }) => {
    const colors = getLabelColors(label.color);

    const handleRemove = useCallback(() => {
      if (onRemove) {
        onRemove(label.id);
      }
    }, [onRemove, label.id]);

    const handleClick = useCallback(() => {
      if (clickable && onClick) {
        onClick();
      }
    }, [clickable, onClick]);

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent) => {
        if (
          clickable &&
          onClick &&
          (event.key === "Enter" || event.key === " ")
        ) {
          event.preventDefault();
          onClick();
        }
      },
      [clickable, onClick],
    );

    // スタイルオブジェクトをメモ化してパフォーマンス向上
    const chipStyles = useMemo(
      () => ({
        display: "inline-flex",
        alignItems: "center",
        bg: colors.bg,
        color: colors.color,
        px: 2,
        py: "3px",
        borderRadius: 1,
        fontSize: 0,
        fontWeight: "400",
        gap: 1,
        border: "none",
        cursor: clickable ? "pointer" : "default",
        outline: "none",
        "&:hover": clickable
          ? {
              opacity: 0.8,
              transform: "scale(1.02)",
            }
          : {},
        "&:focus-visible": clickable
          ? {
              outline: "2px solid",
              outlineColor: "accent.emphasis",
              outlineOffset: "2px",
            }
          : {},
      }),
      [colors.bg, colors.color, clickable],
    );

    const removeButtonStyles = useMemo(
      () => ({
        color: colors.color,
        "&:hover": {
          bg: "rgba(0, 0, 0, 0.1)",
          color: colors.color,
        },
      }),
      [colors.color],
    );

    return (
      <Box
        as={clickable ? "button" : "div"}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={clickable ? 0 : undefined}
        role={clickable ? "button" : undefined}
        aria-label={clickable ? `${label.name}ラベル` : undefined}
        sx={chipStyles}
      >
        <Text sx={{ fontSize: 0 }}>{label.name}</Text>
        {showRemove && onRemove && (
          <IconButton
            icon={XIcon}
            onClick={handleRemove}
            ariaLabel={`${label.name}ラベルを削除`}
            variant="muted"
            size="small"
            sx={removeButtonStyles}
          />
        )}
      </Box>
    );
  },
);

export default LabelChip;
