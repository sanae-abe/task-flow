import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DndContext, DragOverlay } from "@dnd-kit/core";

import { useKanban } from "../contexts/KanbanContext";
import { useUI } from "../contexts/UIContext";
import type { Task } from "../types";
import type { VirtualRecurringTask } from "../utils/calendarRecurrence";
import { useCalendarDragAndDrop } from "../hooks/useCalendarDragAndDrop";
import CalendarDay from "./CalendarView/components/CalendarDay";
import {
  useCalendarData,
  useCalendarNavigation,
  useCalendarHandlers,
} from "./CalendarView/hooks";

const CalendarView: React.FC = () => {
  const { state, openTaskDetail, updateTask, openTaskForm } = useKanban();
  const { openVirtualTaskDetail } = useUI();

  const { currentDate, navigateMonth, goToToday } = useCalendarNavigation();

  const {
    year,
    month,
    calendarDays,
    tasksGroupedByDate,
    monthNames,
    weekDays,
  } = useCalendarData({
    currentDate,
    state,
  });

  const { handleTaskDateChange, handleTaskClick, handleDateClick } =
    useCalendarHandlers({
      openTaskDetail,
      openVirtualTaskDetail,
      openTaskForm,
      updateTask,
    });

  const {
    activeTask,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useCalendarDragAndDrop({
    onTaskDateChange: handleTaskDateChange,
  });

  if (!state.currentBoard) {
    return (
      <div className="px-8 pt-6 pb-8 h-full flex flex-col">
        <p>ボードが選択されていません</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="px-8 pt-6 pb-8 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl font-semibold">
            {year}年 {monthNames[month]}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth("prev")}
              aria-label="前の月"
            >
              <ChevronLeft size={16} />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              今日
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth("next")}
              aria-label="次の月"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-md shadow-sm">
          <div className="grid grid-cols-7 gap-px bg-border border-b border-border rounded-t-md mb-0">
            {weekDays.map((day) => (
              <div key={day} className="p-2 bg-background text-center font-semibold text-xs text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-border overflow-hidden flex-1">
            {calendarDays.map(({ date, isCurrentMonth, isToday }, index) => {
              const dateKey = date.toDateString();
              const tasksForDate = tasksGroupedByDate.get(dateKey) || [];

              return (
                <CalendarDay
                  key={index}
                  date={date}
                  tasks={tasksForDate}
                  isToday={isToday}
                  isCurrentMonth={isCurrentMonth}
                  onTaskClick={
                    handleTaskClick as (
                      task: Task | VirtualRecurringTask,
                    ) => void
                  }
                  onDateClick={handleDateClick}
                />
              );
            })}
          </div>
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="text-[13px] px-2 py-0.5 rounded-md bg-blue-100 text-blue-600 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] shadow-lg opacity-50 transition-all duration-200">
              {activeTask.title}
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
};

export default CalendarView;
