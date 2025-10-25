"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import IconButton from "../shared/IconButton"

// NativeSelect コンポーネント
const NativeSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-8 w-fit items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
  </select>
))
NativeSelect.displayName = "NativeSelect"

// NativeSelectOption コンポーネント
const NativeSelectOption = React.forwardRef<
  HTMLOptionElement,
  React.OptionHTMLAttributes<HTMLOptionElement>
>(({ className, children, ...props }, ref) => (
  <option
    ref={ref}
    className={cn("", className)}
    {...props}
  >
    {children}
  </option>
))
NativeSelectOption.displayName = "NativeSelectOption"


export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout="dropdown"
      startMonth={new Date(2020, 0)}
      endMonth={new Date(2030, 11)}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col space-y-4 sm:space-x-4 sm:space-y-0",
        month: "!ml-0",
        month_caption: "flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        dropdowns: "w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5",
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        range_end: "day-range-end",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "bg-accent text-accent-foreground",
        outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        disabled: "text-muted-foreground opacity-50",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        PreviousMonthButton: () => <IconButton icon={ChevronLeft} ariaLabel="Previous month" className="hover:bg-gray-100 hover:text-gray-900" />,
        NextMonthButton: () => <IconButton icon={ChevronRight} ariaLabel="Next month" className="hover:bg-gray-100 hover:text-gray-900" />,
        Dropdown: ({ options, value, onChange }) => (
          <NativeSelect
            value={value}
            onChange={onChange}
          >
            {options?.map((option) => (
              <NativeSelectOption
                key={option.value}
                value={option.value.toString()}
                disabled={option.disabled}
              >
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        )
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar, NativeSelect, NativeSelectOption }