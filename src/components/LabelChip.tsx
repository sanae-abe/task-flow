import { X } from "lucide-react";
import { memo, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";

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
    const chipStyle = useMemo(
      () => ({
        backgroundColor: colors.bg,
        color: colors.color,
      }),
      [colors.bg, colors.color],
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

    const Element = clickable ? "button" : "div";

    return (
      <Element
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={clickable ? 0 : undefined}
        role={clickable ? "button" : undefined}
        aria-label={clickable ? `${label.name}ラベル` : undefined}
        className={cn(
          "inline-flex items-center px-2 py-1 rounded text-xs font-normal border-none outline-none",
          clickable
            ? "cursor-pointer hover:opacity-80 hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 transition-all duration-150"
            : "cursor-default"
        )}
        style={chipStyle}
      >
        <span className="text-xs">{label.name}</span>
        {showRemove && onRemove && (
          <IconButton
            icon={X}
            onClick={handleRemove}
            ariaLabel={`${label.name}ラベルを削除`}
            variant="muted"
            size="small"
            style={removeButtonStyles}
            className="h-4 w-4 p-0"
          />
        )}
      </Element>
    );
  },
);

export default LabelChip;
