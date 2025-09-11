import CaryBinApi from "../../CarybinBaseUrl";

/**
 * Cart Service - Handles all cart-related API operations
 * Based on the API endpoints: POST /cart/add, GET /cart, PUT /cart/item/:id, DELETE /cart/item/:id
 */

/**
 * Add item to cart
 * @param {Object} payload - Cart item data
 * @param {string} payload.product_id - Product ID
 * @param {string} payload.product_type - Product type (e.g., "COURSE", "STYLE")
 * @param {number} payload.quantity - Quantity to add
 * @returns {Promise} API response
 */
const addToCart = async (payload) => {
  try {
    // Include style pricing if style is present
    const enhancedPayload = { ...payload };
    if (payload.style_product_id && payload.style_price) {
      enhancedPayload.style_price = parseFloat(payload.style_price);
      console.log("🛒 Style price included:", enhancedPayload.style_price);
    }

    console.log("🛒 Adding item to cart:", enhancedPayload);
    const response = await CaryBinApi.post(`/cart/add`, enhancedPayload);
    console.log("✅ Item added to cart successfully:", response.data);
    return response;
  } catch (error) {
    console.error(
      "❌ Error adding item to cart:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * Get cart details with all items
 * @returns {Promise} API response with cart data
 */
const getCart = async () => {
  try {
    console.log("🛒 Fetching cart details...");
    const response = await CaryBinApi.get(`/cart`);
    console.log("✅ Cart details fetched successfully:", response.data);

    // Log cart summary for debugging
    if (response.data?.data) {
      const cartData = response.data.data;
      console.log("📊 Cart Summary:", {
        itemCount: cartData.items?.length || 0,
        totalValue: cartData.items?.reduce((total, item) => {
          const price = parseFloat(item.price || item.price_at_time || 0);
          const quantity = parseInt(item.quantity || 1);
          return total + price * quantity;
        }, 0),
        userId: cartData.user?.id,
        cartCreated: cartData.created_at,
      });
    }

    return response;
  } catch (error) {
    console.error(
      "❌ Error fetching cart:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * Update cart item with quantity, style, and measurement data
 * @param {Object} payload - Update data
 * @param {string} payload.id - Cart item ID
 * @param {number} payload.quantity - Quantity (required when updating style/measurements to maintain current quantity)
 * @param {string} payload.style_product_id - Style product ID (optional)
 * @param {Object} payload.measurement - Measurement data (optional)
 * @returns {Promise} API response
 */
const updateCartItem = async (payload) => {
  try {
    const updateData = {};

    // Add quantity if provided
    if (payload.quantity !== undefined) {
      updateData.quantity = payload.quantity;
    }

    // Add style if provided
    if (payload.style_product_id) {
      updateData.style_product_id = payload.style_product_id;
    }

    // Add style price if provided
    if (payload.style_price !== undefined) {
      updateData.style_price = parseFloat(payload.style_price);
    }

    // Add measurement if provided
    if (payload.measurement) {
      updateData.measurement = payload.measurement;
    }

    console.log("🛒 Updating cart item:", {
      itemId: payload.id,
      updateData,
    });

    const response = await CaryBinApi.put(
      `/cart/item/${payload.id}`,
      updateData,
    );

    console.log("✅ Cart item updated successfully:", response.data);
    return response;
  } catch (error) {
    console.error(
      "❌ Error updating cart item:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * Remove item from cart
 * @param {Object} payload - Delete data
 * @param {string} payload.id - Cart item ID
 * @returns {Promise} API response
 */
const removeFromCart = async (payload) => {
  try {
    console.log("🛒 Removing item from cart:", { itemId: payload.id });
    const response = await CaryBinApi.delete(`/cart/item/${payload.id}`);
    console.log("✅ Item removed from cart successfully:", response.data);
    return response;
  } catch (error) {
    console.error(
      "❌ Error removing item from cart:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * Add multiple items to cart at once
 * @param {Object} payload - Multiple items data
 * @param {Array} payload.items - Array of cart items
 * @returns {Promise} API response
 */
const addMultipleToCart = async (payload) => {
  try {
    console.log("🛒 Adding multiple items to cart:", {
      itemCount: payload.items?.length || 0,
      items: payload.items,
    });

    const response = await CaryBinApi.post(`/cart/add-multiple`, payload);
    console.log("✅ Multiple items added to cart successfully:", response.data);
    return response;
  } catch (error) {
    console.error(
      "❌ Error adding multiple items to cart:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * Clear entire cart
 * @returns {Promise} API response
 */
const clearCart = async () => {
  try {
    console.log("🛒 Clearing entire cart...");
    const response = await CaryBinApi.delete(`/cart/clear`);
    console.log("✅ Cart cleared successfully:", response.data);
    return response;
  } catch (error) {
    console.error(
      "❌ Error clearing cart:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * Get cart item count
 * @returns {Promise} API response with cart count
 */
const getCartCount = async () => {
  try {
    console.log("🛒 Fetching cart item count...");
    const response = await CaryBinApi.get(`/cart/count`);
    console.log("✅ Cart count fetched:", response.data);
    return response;
  } catch (error) {
    console.error(
      "❌ Error fetching cart count:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * Apply coupon to cart
 * @param {Object} payload - Coupon data
 * @param {string} payload.email - User email
 * @param {string} payload.code - Coupon code to apply
 * @param {string} payload.amount - Cart total amount
 * @returns {Promise} API response
 */
const applyCoupon = async (payload) => {
  try {
    console.log("🛒 CartService: Applying coupon to cart");
    console.log("🛒 CartService: Coupon payload:", payload);
    console.log(
      "🛒 CartService: API endpoint:",
      `/coupon-management/apply-coupon`,
    );
    console.log("🛒 CartService: Payload structure:", {
      email: payload.email,
      code: payload.code,
      amount: payload.amount,
      hasEmail: !!payload.email,
      hasCode: !!payload.code,
      hasAmount: !!payload.amount,
    });

    const response = await CaryBinApi.post(
      `/coupon-management/apply-coupon`,
      payload,
    );

    console.log("✅ CartService: Coupon applied successfully");
    console.log("✅ CartService: Response status:", response.status);
    console.log("✅ CartService: Response data:", response.data);
    console.log("✅ CartService: Discount info:", {
      discountedAmount: response.data?.data?.discountedAmount,
      discount: response.data?.data?.discount,
      message: response.data?.message,
    });

    return response;
  } catch (error) {
    console.error("❌ CartService: Error applying coupon:", error);
    console.error("❌ CartService: Error response:", error.response?.data);
    console.error("❌ CartService: Error status:", error.response?.status);
    console.error("❌ CartService: Failed payload:", payload);
    throw error;
  }
};

/**
 * Remove coupon from cart
 * @returns {Promise} API response
 */
const removeCoupon = async () => {
  try {
    console.log("🛒 Removing coupon from cart...");
    const response = await CaryBinApi.delete(`/cart/remove-coupon`);
    console.log("✅ Coupon removed successfully:", response.data);
    return response;
  } catch (error) {
    console.error(
      "❌ Error removing coupon:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * Create payment for cart
 * @param {Object} payload - Payment data
 * @returns {Promise} API response
 */
const createPayment = async (payload) => {
  try {
    console.log("💳 Creating payment for cart:", payload);

    // Enhanced logging for payment structure
    if (payload.purchases) {
      console.log("🛍️ Payment purchases:", {
        totalPurchases: payload.purchases.length,
        fabricCount: payload.purchases.filter(
          (p) => p.purchase_type === "FABRIC",
        ).length,
        styleCount: payload.purchases.filter((p) => p.purchase_type === "STYLE")
          .length,
        purchases: payload.purchases.map((p) => ({
          id: p.purchase_id,
          type: p.purchase_type,
          quantity: p.quantity,
        })),
      });
    }

    if (payload.metadata) {
      console.log("📏 Payment metadata:", {
        metadataCount: payload.metadata.length,
        styleItems: payload.metadata.map((m) => ({
          style_id: m.style_product_id,
          style_name: m.style_product_name,
          has_measurements: Array.isArray(m.measurement)
            ? m.measurement.length > 0
            : !!m.measurement,
          customer: m.customer_name,
        })),
      });
    }

    const response = await CaryBinApi.post(`/payment/create`, payload);
    console.log("✅ Payment created successfully:", response.data);
    return response;
  } catch (error) {
    console.error(
      "❌ Error creating payment:",
      error.response?.data || error.message,
    );
    console.error("❌ Failed payload structure:", {
      hasPurchases: !!payload.purchases,
      purchaseCount: payload.purchases?.length || 0,
      hasMetadata: !!payload.metadata,
      metadataCount: payload.metadata?.length || 0,
      amount: payload.amount,
      currency: payload.currency,
    });
    throw error;
  }
};

/**
 * Verify payment
 * @param {Object} payload - Payment verification data
 * @param {string} payload.id - Payment ID
 * @returns {Promise} API response
 */
const verifyPayment = async (payload) => {
  try {
    console.log("💳 Verifying payment:", { paymentId: payload.id });
    const response = await CaryBinApi.post(`/payment/verify/${payload.id}`);
    console.log("✅ Payment verified successfully:", response.data);
    return response;
  } catch (error) {
    console.error(
      "❌ Error verifying payment:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * Utility function to calculate cart totals
 * @param {Array} cartItems - Array of cart items
 * @returns {Object} Calculated totals
 */
const calculateCartTotals = (cartItems = []) => {
  const subtotal = cartItems.reduce((total, item) => {
    const fabricPrice = parseFloat(item.price || item.price_at_time || 0);
    const stylePrice = parseFloat(item.style_product?.price || 0);
    const quantity = parseInt(item.quantity || 1);
    return total + fabricPrice * quantity + stylePrice;
  }, 0);

  const tax = subtotal * 0.1; // 10% tax (adjust as needed)
  const shipping = cartItems.length > 0 ? 500 : 0; // ₦500 shipping if items exist
  const total = subtotal + tax + shipping;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    shipping: shipping,
    total: Math.round(total * 100) / 100,
    itemCount: cartItems.length,
    totalQuantity: cartItems.reduce(
      (sum, item) => sum + parseInt(item.quantity || 1),
      0,
    ),
  };
};

// Main Cart Service Object
const CartService = {
  // Core CRUD operations
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,

  // Bulk operations
  addMultipleToCart,
  clearCart,

  // Additional operations
  getCartCount,
  applyCoupon,
  removeCoupon,

  // Payment operations
  createPayment,
  verifyPayment,

  // Utility functions
  calculateCartTotals,

  // Legacy compatibility (keeping old method names)
  addCartProduct: addToCart,
  deleteCart: removeFromCart,
  addMultipleCartProduct: addMultipleToCart,
};

export default CartService;
