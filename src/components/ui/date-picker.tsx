"use client"

import * as React from "react"
import { format, parse, parseISO, isValid } from "date-fns"
import { ja } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// 日付形式の定数
const DATE_FORMATS = [
  "yyyy-MM-dd",
  "yyyy/MM/dd",
  "MM/dd/yyyy",
  "dd/MM/yyyy",
  "yyyy年MM月dd日",
  "MM月dd日",
  "M月d日",
];

interface DatePickerProps {
  value?: string | null
  onChange: (value: string | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  validator?: (date: Date) => boolean
  onError?: (error: string) => void
}

export function DatePicker({
  value,
  onChange,
  placeholder = "日付を選択",
  disabled = false,
  className,
  validator: _validator,
  onError: _onError,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")
  const [isEditing, setIsEditing] = React.useState(false)
  const [_error, _setError] = React.useState<string | null>(null)

  // valueが文字列の場合はDateオブジェクトに変換
  const selectedDate = React.useMemo(() => value ? new Date(value) : undefined, [value])

  // 日付文字列を解析する関数
  const parseDate = React.useCallback((dateString: string): Date | null => {
    if (!dateString.trim()) {
      _setError(null) // 空文字の場合はエラーをクリア
      return null
    }

    // 入力値の長さチェック（セキュリティ対策）
    if (dateString.length > 50) {
      const errorMsg = "入力された日付文字列が長すぎます"
      _setError(errorMsg)
      if (_onError) {
        _onError(errorMsg)
      }
      return null
    }

    // ISO形式の場合
    try {
      const isoDate = parseISO(dateString)
      if (isValid(isoDate)) {
        // バリデーション関数が提供されている場合はチェック
        if (_validator && !_validator(isoDate)) {
          const errorMsg = "選択された日付は無効です"
          _setError(errorMsg)
          if (_onError) {
            _onError(errorMsg)
          }
          return null
        }
        _setError(null) // エラーをクリア
        return isoDate
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.warn('ISO date parsing failed:', error)
      }
    }

    // 各種形式でパース
    for (const formatStr of DATE_FORMATS) {
      try {
        const parsed = parse(dateString, formatStr, new Date())
        if (isValid(parsed)) {
          // バリデーション関数が提供されている場合はチェック
          if (_validator && !_validator(parsed)) {
            const errorMsg = "選択された日付は無効です"
            _setError(errorMsg)
            if (_onError) {
              _onError(errorMsg)
            }
            return null
          }
          _setError(null) // エラーをクリア
          return parsed
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.warn(`Date parsing failed for format ${formatStr}:`, error)
        }
      }
    }

    // すべての形式で解析に失敗した場合
    const errorMsg = "日付の形式が正しくありません"
    _setError(errorMsg)
    if (_onError) {
      _onError(errorMsg)
    }
    return null
  }, [_validator, _onError])

  const handleSelect = React.useCallback((date: Date | undefined) => {
    if (date) {
      // YYYY-MM-DD形式で文字列に変換
      const formattedDate = format(date, "yyyy-MM-dd")
      onChange(formattedDate)
    } else {
      onChange("")
    }
    setOpen(false)
  }, [onChange])

  const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    // リアルタイムで日付解析
    const parsedDate = parseDate(newValue)
    if (parsedDate) {
      const formattedDate = format(parsedDate, "yyyy-MM-dd")
      onChange(formattedDate)
    } else if (!newValue.trim()) {
      onChange("")
    }
  }, [parseDate, onChange])

  const handleFocus = React.useCallback(() => {
    setIsEditing(true)
    setInputValue(value || "")
  }, [value])

  const handleBlur = React.useCallback(() => {
    setIsEditing(false)
    const parsedDate = parseDate(inputValue)
    if (parsedDate) {
      const formattedDate = format(parsedDate, "yyyy-MM-dd")
      onChange(formattedDate)
    } else if (inputValue.trim() && !parsedDate) {
      // 無効な日付の場合は元の値に戻す
      setInputValue(value || "")
    }
  }, [inputValue, parseDate, onChange, value])

  // 表示用の値を決定
  const displayValue = React.useMemo(() => {
    if (isEditing) {
      return inputValue
    }

    if (selectedDate && isValid(selectedDate)) {
      return format(selectedDate, "yyyy年MM月dd日", { locale: ja })
    }

    return ""
  }, [isEditing, inputValue, selectedDate])

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Input
          value={displayValue}
          placeholder={placeholder}
          className={cn("bg-background pr-10", className)}
          disabled={disabled}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          role="textbox"
          aria-label="日付入力"
          aria-describedby="date-picker-help"
          aria-invalid={!!_error}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              if (!disabled) {
                setOpen(true)
              }
            } else if (e.key === "Enter") {
              e.preventDefault()
              const parsedDate = parseDate(inputValue)
              if (parsedDate) {
                setIsEditing(false)
                setOpen(false)
              }
            } else if (e.key === "Escape") {
              e.preventDefault()
              setIsEditing(false)
              setInputValue(value || "")
              setOpen(false)
            }
          }}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2 p-0"
              disabled={disabled}
            >
              <CalendarIcon className="h-4 w-4" />
              <span className="sr-only">カレンダーを開く</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              captionLayout="dropdown"
              selected={selectedDate}
              onSelect={handleSelect}
              locale={ja}
              startMonth={new Date(2020, 0)}
              endMonth={new Date(2030, 11)}
              disabled={disabled}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* エラーメッセージ */}
      {_error && (
        <div id="date-picker-error" className="text-xs text-destructive" role="alert">
          {_error}
        </div>
      )}
    </div>
  )
}