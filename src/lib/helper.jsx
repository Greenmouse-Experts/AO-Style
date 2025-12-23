import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const maskEmail = (email) => {
  const [localPart, domain] = email.split("@");

  if (localPart.length <= 2) {
    return email;
  }

  const maskedLocalPart = "*****" + localPart.slice(-1);
  return `${maskedLocalPart}@${domain}`;
};

export const formatDateStr = (dateStr, format) => {
  if (format === "relative") {
    return dayjs(dateStr).fromNow(); // e.g. "2 hours ago"
  }

  return dayjs(dateStr).format(format || "D/M/YYYY");
};

export const formatNumberWithCommas = (num) => {
  // Convert to number if it's a string
  const number = typeof num === "string" ? parseFloat(num) : num;

  return number?.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const generateUniqueId = () =>
  "id" + Math.random().toString(36).substr(2, 19);

/**
 * Removes "State" suffix from state names when sending to backend
 * @param {string} state - The state name (e.g., "Lagos State", "Ogun State", "Lagos")
 * @returns {string} - State name without "State" suffix (e.g., "Lagos", "Ogun")
 */
export const removeStateSuffix = (state) => {
  if (!state || typeof state !== "string") return state || "";
  
  // Trim whitespace and check if it ends with "State" (case-insensitive)
  const trimmed = state.trim();
  if (trimmed.toLowerCase().endsWith(" state")) {
    return trimmed.slice(0, -6).trim(); // Remove " State" (6 characters)
  }
  
  return trimmed;
};
