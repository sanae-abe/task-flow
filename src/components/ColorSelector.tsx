import { Box, Button, Text } from "@primer/react";
import { memo, useCallback, KeyboardEvent } from "react";

import { getLabelColors } from "../utils/labelHelpers";
import { LABEL_COLORS } from "../utils/labels";

// 定数
const COLOR_BUTTON_SIZE = 32;
const TRANSITION_DURATION = "0.15s";
const HOVER_SCALE = 1.05;
const FOCUS_OUTLINE_WIDTH = "2px";
const FOCUS_OUTLINE_OFFSET = "1px";

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
      <Box>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            justifyContent: "flex-start",
            flexWrap: "wrap",
          }}
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
                sx={{
                  width: `${COLOR_BUTTON_SIZE}px`,
                  height: `${COLOR_BUTTON_SIZE}px`,
                  minHeight: `${COLOR_BUTTON_SIZE}px`,
                  p: 0,
                  backgroundColor: colors.bg,
                  border: "2px solid",
                  borderColor: isSelected ? "accent.emphasis" : "transparent",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  cursor: "pointer",
                  transition: `all ${TRANSITION_DURATION} ease`,
                  "&:hover": {
                    borderColor: isSelected
                      ? "accent.emphasis"
                      : "neutral.emphasis",
                    transform: `scale(${HOVER_SCALE})`,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    backgroundColor: colors.bg,
                  },
                  "&:focus": {
                    borderColor: "accent.emphasis",
                    outline: `${FOCUS_OUTLINE_WIDTH} solid`,
                    outlineColor: "accent.fg",
                    outlineOffset: FOCUS_OUTLINE_OFFSET,
                    backgroundColor: colors.bg,
                  },
                }}
              >
                <Text
                  sx={{
                    fontSize: 1,
                    color: colors.color,
                    textAlign: "center",
                    fontWeight: "semibold",
                    pointerEvents: "none",
                    lineHeight: 1,
                  }}
                >
                  {color.name.charAt(0)}
                </Text>
              </Button>
            );
          })}
        </Box>
      </Box>
    );
  },
);

ColorSelector.displayName = "ColorSelector";

export default ColorSelector;
