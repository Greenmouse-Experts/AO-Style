// Subscription Test Utilities
// This file contains helper functions to test and validate subscription upgrade functionality

/**
 * Validates the subscription upgrade payload structure
 * @param {Object} payload - The upgrade payload
 * @returns {Object} - Validation result with isValid and errors
 */
export const validateUpgradePayload = (payload) => {
  const errors = [];
  let isValid = true;

  if (!payload) {
    errors.push("Payload is required");
    isValid = false;
    return { isValid, errors };
  }

  if (!payload.subscription_id) {
    errors.push("subscription_id is required");
    isValid = false;
  }

  if (!payload.new_plan_price_id) {
    errors.push("new_plan_price_id is required");
    isValid = false;
  }

  // Validate that IDs are in UUID format (basic check)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (payload.subscription_id && !uuidRegex.test(payload.subscription_id)) {
    errors.push("subscription_id must be a valid UUID");
    isValid = false;
  }

  if (payload.new_plan_price_id && !uuidRegex.test(payload.new_plan_price_id)) {
    errors.push("new_plan_price_id must be a valid UUID");
    isValid = false;
  }

  return { isValid, errors };
};

/**
 * Simulates the subscription upgrade API call for testing
 * @param {Object} payload - The upgrade payload
 * @returns {Promise} - Mock API response
 */
export const mockUpgradeSubscription = async (payload) => {
  const validation = validateUpgradePayload(payload);

  if (!validation.isValid) {
    return Promise.reject({
      response: {
        data: {
          message: validation.errors,
          status: 400
        }
      }
    });
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock successful response
  return Promise.resolve({
    data: {
      statusCode: 200,
      message: "Subscription upgrade initiated successfully.",
      data: {
        subscription_id: payload.subscription_id,
        new_plan_price_id: payload.new_plan_price_id,
        authorization_url: "https://checkout.paystack.com/mock-upgrade",
        updated_at: new Date().toISOString()
      }
    }
  });
};

/**
 * Tests if a user can upgrade to a specific plan
 * @param {Object} currentSubscription - User's current subscription
 * @param {Object} targetPlan - Plan to upgrade to
 * @returns {Object} - Upgrade eligibility result
 */
export const checkUpgradeEligibility = (currentSubscription, targetPlan) => {
  const result = {
    canUpgrade: false,
    reason: null,
    upgradeType: null
  };

  if (!currentSubscription) {
    result.reason = "No active subscription found";
    return result;
  }

  if (!currentSubscription.is_active) {
    result.reason = "Current subscription is not active";
    return result;
  }

  if (!targetPlan) {
    result.reason = "Target plan not found";
    return result;
  }

  if (currentSubscription.id === targetPlan.id) {
    result.reason = "Already subscribed to this plan";
    return result;
  }

  // Check if it's a free plan
  if (targetPlan.subscription_plan_prices?.[0]?.period === "free") {
    result.reason = "Cannot upgrade to free plan";
    return result;
  }

  // Determine upgrade type based on price comparison
  const currentPrice = parseFloat(currentSubscription.subscription_plan_prices?.[0]?.price || 0);
  const targetPrice = parseFloat(targetPlan.subscription_plan_prices?.[0]?.price || 0);

  if (targetPrice > currentPrice) {
    result.upgradeType = "upgrade";
  } else if (targetPrice < currentPrice) {
    result.upgradeType = "downgrade";
  } else {
    result.upgradeType = "lateral";
  }

  result.canUpgrade = true;
  result.reason = `${result.upgradeType} available`;

  return result;
};

/**
 * Formats subscription data for display
 * @param {Object} subscription - Subscription object
 * @returns {Object} - Formatted subscription data
 */
export const formatSubscriptionData = (subscription) => {
  if (!subscription) return null;

  const price = subscription.subscription_plan_prices?.[0];
  const formattedPrice = price?.price ?
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price.price) : 'Free';

  return {
    id: subscription.id,
    name: subscription.name,
    description: subscription.description,
    price: formattedPrice,
    period: price?.period || 'unknown',
    isActive: subscription.is_active || false,
    createdAt: subscription.created_at,
    maxQuantity: subscription.max_quantity || 'Unlimited'
  };
};

/**
 * Debug helper to log subscription-related data
 * @param {string} context - Context of the log
 * @param {Object} data - Data to log
 */
export const debugSubscription = (context, data) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔄 Subscription Debug: ${context}`);
    console.log('Data:', data);
    console.log('Timestamp:', new Date().toISOString());
    console.groupEnd();
  }
};

/**
 * Creates a test scenario for subscription upgrade
 * @returns {Object} - Test data structure
 */
export const createTestScenario = () => {
  return {
    currentSubscription: {
      id: "d7595cf9-5172-47fe-a19f-bf23fac96081",
      name: "vendor ember plan",
      description: "This is a plan for vendors",
      is_active: true,
      subscription_plan_prices: [{
        id: "93701639-c41d-4f3f-8063-d680ad143414",
        price: "20000",
        period: "monthly"
      }],
      created_at: "2025-09-01 12:33:28.215"
    },
    targetPlan: {
      id: "e214f331-83d6-485a-8f45-cf666bcf7148",
      name: "QA Plan",
      description: "Testing Plan",
      subscription_plan_prices: [{
        id: "6643b6d2-cbe8-42da-9154-56e156e6302d",
        price: "50000",
        period: "monthly"
      }]
    },
    expectedPayload: {
      subscription_id: "d7595cf9-5172-47fe-a19f-bf23fac96081",
      new_plan_price_id: "6643b6d2-cbe8-42da-9154-56e156e6302d"
    }
  };
};

export default {
  validateUpgradePayload,
  mockUpgradeSubscription,
  checkUpgradeEligibility,
  formatSubscriptionData,
  debugSubscription,
  createTestScenario
};
