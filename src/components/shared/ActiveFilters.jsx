import React from "react";
import { FaTimes } from "react-icons/fa";

const ActiveFilters = ({ activeFilters, onRemoveFilter, onClearAll }) => {
  if (!activeFilters || activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-sm text-gray-600 font-medium">Active Filters:</span>

      {activeFilters.map((filter, index) => (
        <div
          key={`${filter.type}-${index}`}
          className="flex items-center gap-2 bg-gradient-to-r from-[#9847FE] to-[#B347FE] text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-sm"
        >
          <span>{filter.label}</span>
          <button
            onClick={() => onRemoveFilter(filter.type)}
            className="hover:bg-white/20 rounded-full p-0.5 transition-colors cursor-pointer"
          >
            <FaTimes size={10} />
          </button>
        </div>
      ))}

      {activeFilters.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-xs text-gray-500 hover:text-red-500 underline font-medium transition-colors cursor-pointer"
        >
          Clear All
        </button>
      )}
    </div>
  );
};

export default ActiveFilters;
