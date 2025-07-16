import { useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";

export default function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showMiniCalendar, setShowMiniCalendar] = useState(false);

  const today = new Date();
  const isToday = (date) => {
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const formatDate = (date) => {
    return {
      day: date.getDate(),
      dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
      month: date.toLocaleDateString('en-US', { month: 'long' }),
      year: date.getFullYear()
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
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const { day, dayName, month, year } = formatDate(selectedDate);

  return (
    <div className="bg-white rounded-xl overflow-hidden w-full calendar-widget-shadow h-[334px] flex flex-col">
      {/* Header with Calendar Icon */}
      <div className="calendar-widget-header px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-center text-white relative z-10">
          <CalendarDaysIcon className="w-6 h-6 mr-2" />
          <h3 className="font-semibold text-lg">Calendar</h3>
        </div>
      </div>

      {/* Main Date Display */}
      <div 
        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 calendar-date-display flex-1 flex items-center justify-center"
        onClick={() => setShowMiniCalendar(!showMiniCalendar)}
      >
        <div className="text-center">
          <div className="text-5xl font-bold text-purple-500 mb-2">
            {day}
          </div>
          <div className="text-base font-semibold text-gray-800 mb-1">
            {dayName}
          </div>
          <div className="text-sm text-gray-600 mb-2">
            {month} {year}
          </div>
          {isToday(selectedDate) && (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
              • Today
            </div>
          )}
          <div className="mt-3 text-xs text-gray-500 flex items-center justify-center">
            <span>Click to {showMiniCalendar ? 'hide' : 'view'} calendar</span>
            <ChevronRightIcon className={`w-3 h-3 ml-1 calendar-toggle-icon ${showMiniCalendar ? 'rotate-90' : ''}`} />
          </div>
        </div>
      </div>

      {/* Mini Calendar (collapsible) */}
      {showMiniCalendar && (
        <div className="bg-gray-50 border-t border-gray-200 p-3 flex-shrink-0 overflow-hidden">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200"
            >
              <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
            </button>
            <div className="text-sm font-semibold text-gray-900 bg-white px-2 py-1 rounded-lg shadow-sm border border-gray-200">
              {currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </div>
            <button
              onClick={() => navigateMonth(1)}
              className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200"
            >
              <ChevronRightIcon className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200">
            <div className="grid grid-cols-7 gap-1 text-xs">
              {/* Day headers */}
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={index} className="p-1 text-center font-semibold text-gray-600 text-xs">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {getDaysInMonth(currentDate).map((date, index) => (
                <div key={index} className="p-0.5">
                  {date && (
                    <button
                      onClick={() => {
                        setSelectedDate(date);
                        setShowMiniCalendar(false);
                      }}
                      className={`w-full h-5 text-center rounded text-xs font-medium transition-all duration-200 ${
                        selectedDate && 
                        date.getDate() === selectedDate.getDate() &&
                        date.getMonth() === selectedDate.getMonth() &&
                        date.getFullYear() === selectedDate.getFullYear()
                          ? 'bg-blue-500 text-white shadow-md scale-105'
                          : isToday(date)
                          ? 'bg-blue-100 text-blue-700 font-semibold border border-blue-200'
                          : 'hover:bg-gray-100 text-gray-700 hover:scale-105'
                      }`}
                    >
                      {date.getDate()}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
