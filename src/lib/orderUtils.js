/**
 * Order Utilities
 * Helper functions for order-related operations
 */

/**
 * Formats an order ID to display the first 12 characters in uppercase without hyphens
 * @param {string} id - The order ID to format
 * @returns {string} - Formatted order ID (e.g., "A1B2C3D4E5F6")
 */
export const formatOrderId = (id) => {
  if (!id || typeof id !== 'string') return "N/A";
  return id.replace(/-/g, "").substring(0, 12).toUpperCase();
};

/**
 * Formats a transaction ID to display the first 12 characters in uppercase without hyphens
 * @param {string} id - The transaction ID to format
 * @returns {string} - Formatted transaction ID
 */
export const formatTransactionId = (id) => {
  if (!id || typeof id !== 'string') return "N/A";
  return id.replace(/-/g, "").substring(0, 12).toUpperCase();
};

/**
 * Formats a user ID to display the first 12 characters in uppercase without hyphens
 * @param {string} id - The user ID to format
 * @returns {string} - Formatted user ID
 */
export const formatUserId = (id) => {
  if (!id || typeof id !== 'string') return "N/A";
  return id.replace(/-/g, "").substring(0, 12).toUpperCase();
};

/**
 * Gets a display-friendly order ID with # prefix
 * @param {string} id - The order ID to format
 * @returns {string} - Formatted order ID with # prefix (e.g., "#A1B2C3D4E5F6")
 */
export const getDisplayOrderId = (id) => {
  return `#${formatOrderId(id)}`;
};

/**
 * Gets a display-friendly transaction ID with # prefix
 * @param {string} id - The transaction ID to format
 * @returns {string} - Formatted transaction ID with # prefix
 */
export const getDisplayTransactionId = (id) => {
  return `#${formatTransactionId(id)}`;
};

/**
 * Gets a display-friendly user ID with # prefix
 * @param {string} id - The user ID to format
 * @returns {string} - Formatted user ID with # prefix
 */
export const getDisplayUserId = (id) => {
  return `#${formatUserId(id)}`;
};

/**
 * Validates if an ID string is in valid UUID format
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if valid UUID format
 */
export const isValidUUID = (id) => {
  if (!id || typeof id !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * Truncates order details for display in tables
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length before truncation (default: 20)
 * @returns {string} - Truncated text with ellipsis if needed
 */
export const truncateOrderText = (text, maxLength = 20) => {
  if (!text || typeof text !== 'string') return "N/A";
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Formats order status for display (replaces underscores with spaces and capitalizes)
 * @param {string} status - The order status to format
 * @returns {string} - Formatted status
 */
export const formatOrderStatus = (status) => {
  if (!status || typeof status !== 'string') return "Unknown";
  return status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Gets order type based on order items
 * @param {Array} orderItems - Array of order items
 * @returns {string} - "fabric_only" or "fabric_style"
 */
export const getOrderType = (orderItems) => {
  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    return "unknown";
  }

  const hasStyleItems = orderItems.some((item) => {
    return (
      item?.product?.type?.toLowerCase().includes("style") ||
      item?.type?.toLowerCase().includes("style") ||
      item?.product?.name?.toLowerCase().includes("style") ||
      item?.name?.toLowerCase().includes("style")
    );
  });

  return hasStyleItems ? "fabric_style" : "fabric_only";
};

/**
 * Gets order type display name
 * @param {Array} orderItems - Array of order items
 * @returns {string} - "Fabric Only" or "Fabric + Style"
 */
export const getOrderTypeDisplay = (orderItems) => {
  const type = getOrderType(orderItems);
  switch (type) {
    case "fabric_only":
      return "Fabric Only";
    case "fabric_style":
      return "Fabric + Style";
    default:
      return "Unknown";
  }
};

/**
 * Checks if an order has style components based on metadata
 * @param {Array} metadata - Payment metadata array
 * @returns {boolean} - True if order has style components
 */
export const hasStyleMetadata = (metadata) => {
  if (!Array.isArray(metadata)) return false;

  return metadata.some(
    (meta) =>
      meta?.style_product_id ||
      meta?.measurement ||
      meta?.style_product_name
  );
};
