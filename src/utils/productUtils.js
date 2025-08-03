/**
 * Utility functions for product-related operations
 */

/**
 * Validates if a product ID is a valid UUID format
 * @param {string} productId - The product ID to validate
 * @returns {boolean} - True if valid UUID format, false otherwise
 */
export const isValidProductId = (productId) => {
  if (!productId || typeof productId !== 'string') {
    return false;
  }

  // UUID v4 regex pattern
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(productId);
};

/**
 * Extracts the correct product ID for reviews from product data
 * Prioritizes product_id field over id field for API consistency
 * @param {object} productData - The product data object
 * @returns {string|null} - The correct product ID or null if not found
 */
export const getReviewProductId = (productData) => {
  if (!productData) {
    return null;
  }

  // For shop products, prefer product_id field
  const productId = productData.product_id || productData.id;

  // Validate the extracted ID
  if (isValidProductId(productId)) {
    return productId;
  }

  return null;
};

/**
 * Logs product ID analysis for debugging
 * @param {object} productData - The product data object
 * @param {string} context - Context where this is being called from
 */
export const debugProductId = (productData, context = 'Unknown') => {
  const productId = getReviewProductId(productData);

  console.log(`🔍 ${context}: Product ID Analysis:`, {
    hasData: !!productData,
    dataKeys: productData ? Object.keys(productData) : null,
    id: productData?.id,
    product_id: productData?.product_id,
    extractedProductId: productId,
    isValidProductId: isValidProductId(productId),
    context
  });

  return productId;
};

/**
 * Creates a safe product ID for use in API calls
 * Returns null if the product ID is invalid to prevent API errors
 * @param {object} productData - The product data object
 * @param {string} context - Context for debugging
 * @returns {string|null} - Safe product ID or null
 */
export const getSafeProductId = (productData, context = 'Unknown') => {
  const productId = debugProductId(productData, context);

  if (!isValidProductId(productId)) {
    console.warn(`⚠️ ${context}: Invalid or missing product ID:`, productId);
    return null;
  }

  console.log(`✅ ${context}: Valid product ID:`, productId);
  return productId;
};
