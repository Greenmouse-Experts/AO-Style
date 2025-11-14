import { useState, useEffect } from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

// Simple tooltip component
const Tooltip = ({ children, content, position = "top", showPeriodically = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isPeriodicVisible, setIsPeriodicVisible] = useState(false);

  // Periodic visibility effect
  useEffect(() => {
    if (!showPeriodically) return;

    const showTooltip = () => {
      setIsPeriodicVisible(true);
      setTimeout(() => setIsPeriodicVisible(false), 2000); // Show for 2 seconds
    };

    // Show after 1 second on mount
    const initialTimer = setTimeout(showTooltip, 1000);

    // Then show every 12 seconds
    const interval = setInterval(showTooltip, 12000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [showPeriodically]);

  const shouldShow = isVisible || isPeriodicVisible;

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>

      {shouldShow && (
        <div
          className={`absolute z-50 px-3 py-2 text-xs text-white bg-purple-600 rounded shadow-lg whitespace-nowrap transform transition-all duration-200 ${
            position === "top"
              ? "bottom-full left-1/2 -translate-x-1/2 mb-2"
              : position === "bottom"
              ? "top-full left-1/2 -translate-x-1/2 mt-2"
              : position === "left"
              ? "right-full top-1/2 -translate-y-1/2 mr-2"
              : "left-full top-1/2 -translate-y-1/2 ml-2"
          }`}
        >
          {content}
          {/* Arrow */}
          <div
            className={`absolute w-0 h-0 border-2 ${
              position === "top"
                ? "top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-purple-600"
                : position === "bottom"
                ? "bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-purple-600"
                : position === "left"
                ? "left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-purple-600"
                : "right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-purple-600"
            }`}
          />
        </div>
      )}
    </div>
  );
};

// Simple info tooltip with icon
export const InfoTooltip = ({
  content,
  position = "top",
  className = "",
  showPeriodically = true
}) => {
  return (
    <Tooltip content={content} position={position} showPeriodically={showPeriodically}>
      <InformationCircleIcon
        className={`w-4 h-4 text-purple-500 hover:text-purple-700 cursor-help ${className}`}
      />
    </Tooltip>
  );
};

// Attention-grabbing version with subtle animations
export const AttentionTooltip = ({
  content,
  position = "top",
  className = ""
}) => {
  return (
    <Tooltip content={content} position={position} showPeriodically={true}>
      <InformationCircleIcon
        className={`w-4 h-4 text-purple-500 hover:text-purple-700 cursor-help animate-pulse ${className}`}
      />
    </Tooltip>
  );
};

export default Tooltip;
