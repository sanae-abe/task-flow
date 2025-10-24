import { Button } from "@/components/ui/button";
import { memo, useCallback, KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

import { getLabelColors } from "../utils/labelHelpers";
import { LABEL_COLORS } from "../utils/labels";

interface ColorSelectorProps {
  readonly selectedColor: string;
  readonly onColorSelect: (color: string) => void;
}

const ColorSelector = memo<ColorSelectorProps>(
  ({ selectedColor, onColorSelect }) => {
    // 色選択ハンドラー（エラーハンドリング付き）
    const handleColorSelect = useCallback(
      (color: string) => {
        try {
          onColorSelect(color);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("色選択エラー:", error);
        }
      },
      [onColorSelect],
    );

    // キーボードナビゲーション
    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLElement>, color: string) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleColorSelect(color);
        }
      },
      [handleColorSelect],
    );

    return (
      <div>
        <div
          className="flex gap-1 justify-start flex-wrap"
          role="radiogroup"
          aria-label="ラベルの色を選択"
        >
          {LABEL_COLORS.map((color) => {
            const colors = getLabelColors(color.variant);
            const isSelected = selectedColor === color.variant;

            return (
              <Button
                key={color.variant}
                onClick={() => handleColorSelect(color.variant)}
                onKeyDown={(e) => handleKeyDown(e, color.variant)}
                aria-label={`${color.name}色を選択`}
                aria-checked={isSelected}
                role="radio"
                tabIndex={isSelected ? 0 : -1}
                variant="ghost"
                size="icon"
                className={cn(
                  "w-8 h-8 min-h-8 p-0 border-2 rounded-md",
                  "flex items-center justify-center relative cursor-pointer",
                  "transition-all duration-150 ease-in-out",
                  "hover:scale-105 hover:shadow-md",
                  "focus:outline-2 focus:outline-blue-500 focus:outline-offset-1",
                  isSelected ? "border-blue-600" : "border-transparent",
                  "hover:border-gray-600"
                )}
                style={{
                  backgroundColor: colors.bg,
                }}
              >
                <span
                  className="text-xs text-center font-semibold pointer-events-none leading-none"
                  style={{ color: colors.color }}
                >
                  {color.name.charAt(0)}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    );
  },
);

ColorSelector.displayName = "ColorSelector";

export default ColorSelector;
