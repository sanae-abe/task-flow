import { useState, useCallback } from "react";

interface UseCalendarNavigationReturn {
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  navigateMonth: (direction: "prev" | "next") => void;
  goToToday: () => void;
}

export const useCalendarNavigation = (): UseCalendarNavigationReturn => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const navigateMonth = useCallback((direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newDate;
    });
  }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  return {
    currentDate,
    setCurrentDate,
    navigateMonth,
    goToToday,
  };
};
