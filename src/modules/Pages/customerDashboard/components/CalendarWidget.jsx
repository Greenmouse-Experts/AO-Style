import { useState, useEffect, useRef } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

export default function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [calendarPosition, setCalendarPosition] = useState("right");
  const calendarRef = useRef(null);
  const widgetRef = useRef(null);

  const today = new Date();
  const isToday = (date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSameDate = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const formatDate = (date) => {
    return {
      day: date.getDate(),
      dayName: date.toLocaleDateString("en-US", { weekday: "long" }),
      month: date.toLocaleDateString("en-US", { month: "long" }),
      year: date.getFullYear(),
    };
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const toggleCalendar = () => {
    if (!showFullCalendar && widgetRef.current) {
      // Calculate optimal position
      const rect = widgetRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const calendarWidth = 384; // 96 * 4 (w-96)

      // Check if there's enough space on the right
      if (rect.right + calendarWidth > viewportWidth - 32) {
        // Not enough space on right, position to the left
        setCalendarPosition("left");
      } else {
        // Enough space on right
        setCalendarPosition("right");
      }
    }
    setShowFullCalendar(!showFullCalendar);
  };

  const selectDate = (date) => {
    setSelectedDate(date);
    setCurrentDate(date); // Also update the current month view
    setShowFullCalendar(false); // Close calendar after selection
  };

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowFullCalendar(false);
      }
    };

    if (showFullCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFullCalendar]);

  const { day, dayName, month, year } = formatDate(selectedDate);

  return (
    <div className="relative" ref={calendarRef}>
      {/* Main Calendar Widget */}
      <div
        ref={widgetRef}
        className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 w-full h-[335px]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
          <div className="flex items-center justify-center text-white">
            <CalendarDaysIcon className="w-6 h-6 mr-2" />
            <h3 className="font-semibold text-lg">Calendar</h3>
          </div>
        </div>

        {/* Main Date Display */}
        <div className="p-6 text-center">
          <div className="text-6xl font-bold text-purple-500 mb-2 leading-none">
            {day}
          </div>
          <div className="text-lg font-semibold text-gray-800 mb-1">
            {dayName}
          </div>
          <div className="text-sm text-gray-600 mb-3">
            {month} {year}
          </div>

          {isToday(selectedDate) && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200 mb-4"
            >
              • Today
            </motion.div>
          )}

          {/* Toggle Button */}
          <button
            onClick={toggleCalendar}
            className="flex items-center justify-center w-full text-xs text-gray-500 hover:text-purple-600 transition-colors duration-200 group"
          >
            <span className="mr-1">
              Click to {showFullCalendar ? "hide" : "view"} calendar
            </span>
            <motion.div
              animate={{ rotate: showFullCalendar ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDownIcon className="w-4 h-4 group-hover:text-purple-600" />
            </motion.div>
          </button>
        </div>
      </div>

      {/* Dropdown Calendar */}
      <AnimatePresence>
        {showFullCalendar && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`absolute top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden w-96 max-w-[calc(100vw-2rem)] ${
              calendarPosition === "left" ? "right-0" : "left-0"
            }`}
          >
            <div className="p-4 sm:p-6">
              {/* Calendar Navigation */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all duration-200 group"
                >
                  <ChevronLeftIcon className="w-5 h-5 text-gray-600 group-hover:text-purple-600" />
                </button>

                <div className="text-sm sm:text-lg font-semibold text-gray-900 bg-purple-50 px-3 sm:px-4 py-2 rounded-lg border border-purple-100">
                  {currentDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </div>

                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all duration-200 group"
                >
                  <ChevronRightIcon className="w-5 h-5 text-gray-600 group-hover:text-purple-600" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="mb-4">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-3">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day, index) => (
                      <div
                        key={index}
                        className="p-2 sm:p-3 text-center font-semibold text-gray-600 text-xs sm:text-sm"
                      >
                        {day}
                      </div>
                    ),
                  )}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(currentDate).map((date, index) => (
                    <div key={index} className="p-1">
                      {date ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => selectDate(date)}
                          className={`w-full h-10 sm:h-12 text-center rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 relative ${
                            isSameDate(selectedDate, date)
                              ? "bg-purple-500 text-white shadow-lg ring-2 ring-purple-200"
                              : isToday(date)
                                ? "bg-purple-100 text-purple-700 font-bold border-2 border-purple-300"
                                : "hover:bg-purple-50 text-gray-700 hover:text-purple-600 border border-transparent hover:border-purple-200"
                          }`}
                        >
                          {date.getDate()}
                          {isToday(date) && !isSameDate(selectedDate, date) && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full"></div>
                          )}
                        </motion.button>
                      ) : (
                        <div className="w-full h-10 sm:h-12"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-100 gap-2 sm:gap-0">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => selectDate(new Date())}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-purple-500 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-purple-600 transition-colors duration-200 shadow-sm"
                >
                  Go to Today
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={toggleCalendar}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-200 transition-colors duration-200 shadow-sm"
                >
                  Close Calendar
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
