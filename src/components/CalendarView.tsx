import React from "react";
import { Text, Button, IconButton } from "@primer/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@primer/octicons-react";
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
import { calendarStyles } from "./CalendarView/styles/calendarStyles";

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
      <div style={calendarStyles.container}>
        <Text>ボードが選択されていません</Text>
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
      <div style={calendarStyles.container}>
        <div style={calendarStyles.header}>
          <span style={calendarStyles.title}>
            {year}年 {monthNames[month]}
          </span>
          <div style={calendarStyles.navigation}>
            <IconButton
              icon={ChevronLeftIcon}
              aria-label="前の月"
              onClick={() => navigateMonth("prev")}
              size="small"
            />
            <Button size="small" onClick={goToToday}>
              今日
            </Button>
            <IconButton
              icon={ChevronRightIcon}
              aria-label="次の月"
              onClick={() => navigateMonth("next")}
              size="small"
            />
          </div>
        </div>

        <div style={calendarStyles.calendarGridContainer}>
          <div style={calendarStyles.weekHeader}>
            {weekDays.map((day) => (
              <div key={day} style={calendarStyles.weekDay}>
                {day}
              </div>
            ))}
          </div>

          <div style={calendarStyles.calendarGrid}>
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
            <div style={calendarStyles.dragOverlay}>{activeTask.title}</div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
};

export default CalendarView;
