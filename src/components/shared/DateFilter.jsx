import React, { useState, useMemo } from "react";
import { FaCalendarAlt, FaTimes } from "react-icons/fa";

const DateFilter = ({
  onFiltersChange,
  activeFilters = [],
  onClearAll
}) => {
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateFilters, setDateFilters] = useState({
    day: "",
    month: "",
    year: "",
    dateRange: {
      from: "",
      to: "",
    },
  });

  // Generate years for dropdown (last 10 years)
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 10; i++) {
      years.push(currentYear - i);
    }
    return years;
  }, []);

  const monthOptions = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // Apply date filter
  const applyDateFilter = () => {
    const newActiveFilters = [];

    if (dateFilters.dateRange.from && dateFilters.dateRange.to) {
      newActiveFilters.push({
        type: "dateRange",
        label: `${dateFilters.dateRange.from} to ${dateFilters.dateRange.to}`,
        value: dateFilters.dateRange,
      });
    }

    if (dateFilters.day) {
      newActiveFilters.push({
        type: "day",
        label: `Day: ${dateFilters.day}`,
        value: dateFilters.day,
      });
    }

    if (dateFilters.month) {
      const monthLabel = monthOptions.find(
        (m) => m.value === dateFilters.month,
      )?.label;
      newActiveFilters.push({
        type: "month",
        label: `Month: ${monthLabel}`,
        value: dateFilters.month,
      });
    }

    if (dateFilters.year) {
      newActiveFilters.push({
        type: "year",
        label: `Year: ${dateFilters.year}`,
        value: dateFilters.year,
      });
    }

    onFiltersChange(newActiveFilters, dateFilters);
    setShowDateFilter(false);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setDateFilters({
      day: "",
      month: "",
      year: "",
      dateRange: { from: "", to: "" },
    });
    onClearAll();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDateFilter(!showDateFilter)}
        className={`flex items-center gap-2 px-4 py-2.5 text-sm border rounded-lg transition-all duration-200 cursor-pointer font-medium ${
          activeFilters.length > 0
            ? "bg-gradient-to-r from-[#9847FE] to-[#B347FE] text-white border-transparent shadow-lg shadow-purple-200 hover:shadow-purple-300"
            : "bg-white text-gray-700 border-gray-300 hover:border-[#9847FE] hover:bg-purple-50 hover:text-[#9847FE]"
        }`}
      >
        <FaCalendarAlt size={14} />
        Date Filter
        {activeFilters.length > 0 && (
          <span className="bg-white text-[#9847FE] text-xs px-2 py-1 rounded-full font-semibold min-w-[20px] flex items-center justify-center">
            {activeFilters.length}
          </span>
        )}
      </button>

      {/* Date Filter Dropdown */}
      {showDateFilter && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDateFilter(false)}
          />

          {/* Dropdown Panel */}
          <div
            className="fixed left-0 top-0 w-full h-full flex items-start justify-center z-50"
            style={{ pointerEvents: "none" }}
          >
            <div
              className="mt-24 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-top-2 duration-200"
              style={{
                pointerEvents: "auto",
                maxWidth: "95vw",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#9847FE] to-[#B347FE] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-white" size={16} />
                    <h3 className="font-semibold text-white">
                      Filter by Date
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowDateFilter(false)}
                    className="text-white hover:bg-white/20 rounded-full p-1 transition-colors cursor-pointer"
                  >
                    <FaTimes size={14} />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-5">
                {/* Quick Filter Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const today = new Date();
                      const lastMonth = new Date(
                        today.getFullYear(),
                        today.getMonth() - 1,
                        today.getDate(),
                      );
                      setDateFilters({
                        ...dateFilters,
                        dateRange: {
                          from: lastMonth.toISOString().split("T")[0],
                          to: today.toISOString().split("T")[0],
                        },
                      });
                    }}
                    className="px-3 py-2 text-xs bg-purple-50 text-[#9847FE] rounded-lg hover:bg-purple-100 transition-colors cursor-pointer border border-purple-200"
                  >
                    Last 30 Days
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date();
                      const currentYear = today.getFullYear();
                      setDateFilters({
                        ...dateFilters,
                        year: currentYear.toString(),
                        month: "",
                        day: "",
                        dateRange: { from: "", to: "" },
                      });
                    }}
                    className="px-3 py-2 text-xs bg-purple-50 text-[#9847FE] rounded-lg hover:bg-purple-100 transition-colors cursor-pointer border border-purple-200"
                  >
                    This Year
                  </button>
                </div>

                {/* Date Range Filter */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#9847FE] rounded-full"></span>
                    Date Range
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
                    <div className="flex-1 min-w-0">
                      <label className="block text-xs text-gray-600 mb-1">
                        From
                      </label>
                      <input
                        type="date"
                        value={dateFilters.dateRange.from}
                        onChange={(e) =>
                          setDateFilters({
                            ...dateFilters,
                            dateRange: {
                              ...dateFilters.dateRange,
                              from: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#9847FE] focus:border-transparent cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-center sm:pt-6">
                      <span className="text-gray-400 font-medium">→</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-xs text-gray-600 mb-1">
                        To
                      </label>
                      <input
                        type="date"
                        value={dateFilters.dateRange.to}
                        onChange={(e) =>
                          setDateFilters({
                            ...dateFilters,
                            dateRange: {
                              ...dateFilters.dateRange,
                              to: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#9847FE] focus:border-transparent cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="flex items-center">
                  <div className="flex-1 border-t border-gray-200"></div>
                  <span className="px-3 text-xs text-gray-500 font-medium">
                    OR FILTER BY
                  </span>
                  <div className="flex-1 border-t border-gray-200"></div>
                </div>

                {/* Specific Filters Grid */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Year Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Year
                    </label>
                    <select
                      value={dateFilters.year}
                      onChange={(e) =>
                        setDateFilters({
                          ...dateFilters,
                          year: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#9847FE] focus:border-transparent cursor-pointer bg-white"
                    >
                      <option value="">All</option>
                      {yearOptions.map((year) => (
                        <option key={year} value={year.toString()}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Month Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Month
                    </label>
                    <select
                      value={dateFilters.month}
                      onChange={(e) =>
                        setDateFilters({
                          ...dateFilters,
                          month: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#9847FE] focus:border-transparent cursor-pointer bg-white"
                    >
                      <option value="">All</option>
                      {monthOptions.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Day Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Day
                    </label>
                    <select
                      value={dateFilters.day}
                      onChange={(e) =>
                        setDateFilters({
                          ...dateFilters,
                          day: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#9847FE] focus:border-transparent cursor-pointer bg-white"
                    >
                      <option value="">All</option>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(
                        (day) => (
                          <option
                            key={day}
                            value={day.toString().padStart(2, "0")}
                          >
                            {day}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={applyDateFilter}
                    className="flex-1 bg-gradient-to-r from-[#9847FE] to-[#B347FE] text-white py-3 px-4 rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-purple-200 transition-all duration-200 cursor-pointer"
                  >
                    Apply Filters
                  </button>
                  <button
                    onClick={clearAllFilters}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DateFilter;
