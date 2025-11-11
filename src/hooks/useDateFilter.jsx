import { useState, useCallback } from "react";

const useDateFilter = () => {
  const [activeFilters, setActiveFilters] = useState([]);
  const [dateFilters, setDateFilters] = useState({
    day: "",
    month: "",
    year: "",
    dateRange: {
      from: "",
      to: "",
    },
  });

  // Function to check if a date matches the filter criteria
  const matchesDateFilter = useCallback(
    (dateString) => {
      if (!dateString) return true;

      const date = new Date(dateString);
      const { day, month, year, dateRange } = dateFilters;

      // Check date range filter
      if (dateRange.from && dateRange.to) {
        const fromDate = new Date(dateRange.from);
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999); // Include the entire end date

        if (date < fromDate || date > toDate) {
          return false;
        }
      }

      // Check specific day filter
      if (day && date.getDate().toString().padStart(2, "0") !== day) {
        return false;
      }

      // Check month filter
      if (
        month &&
        (date.getMonth() + 1).toString().padStart(2, "0") !== month
      ) {
        return false;
      }

      // Check year filter
      if (year && date.getFullYear().toString() !== year) {
        return false;
      }

      return true;
    },
    [dateFilters],
  );

  // Handle filters change from DateFilter component
  const handleFiltersChange = useCallback(
    (newActiveFilters, newDateFilters) => {
      setActiveFilters(newActiveFilters);
      setDateFilters(newDateFilters);
    },
    [],
  );

  // Clear specific filter
  const removeFilter = useCallback(
    (filterType) => {
      const updatedFilters = { ...dateFilters };
      const updatedActiveFilters = activeFilters.filter(
        (filter) => filter.type !== filterType,
      );

      if (filterType === "dateRange") {
        updatedFilters.dateRange = { from: "", to: "" };
      } else {
        updatedFilters[filterType] = "";
      }

      setDateFilters(updatedFilters);
      setActiveFilters(updatedActiveFilters);
    },
    [dateFilters, activeFilters],
  );

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setDateFilters({
      day: "",
      month: "",
      year: "",
      dateRange: { from: "", to: "" },
    });
    setActiveFilters([]);
  }, []);

  // Filter data based on date field
  const filterDataByDate = useCallback(
    (data, dateField = "created_at") => {
      if (!data || !Array.isArray(data)) return [];

      return data.filter((item) => {
        const dateValue = item[dateField] || item.rawDate || item.dateJoined;
        return matchesDateFilter(dateValue);
      });
    },
    [matchesDateFilter],
  );

  return {
    activeFilters,
    dateFilters,
    matchesDateFilter,
    handleFiltersChange,
    removeFilter,
    clearAllFilters,
    filterDataByDate,
  };
};

export default useDateFilter;
