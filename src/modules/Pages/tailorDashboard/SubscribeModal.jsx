import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaBriefcase, FaTimes } from "react-icons/fa";
import useCreateSubscriptionPayment from "../../../hooks/subscription/useCreateSubscriptionPayment";
import { useCarybinUserStore } from "../../../store/carybinUserStore";
import useVerifySubPay from "../../../hooks/subscription/useVerifySubPay";
import useUpgradeSubscription from "../../../hooks/subscription/useUpgradeSubscription";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import CaryBinApi from "../../../services/CarybinBaseUrl";

const SubscriptionModal = ({
  onClose,
  refetch,
  currentView,
  onPaystackSuccess,
}) => {
  const { isPending: createPending, createSubMutate } =
    useCreateSubscriptionPayment();
  const { carybinUser } = useCarybinUserStore();

  const { isPending: verifyPending, verifyPaymentMutate } = useVerifySubPay();
  const { isPending: upgradePending, upgradeSubscriptionMutate } =
    useUpgradeSubscription();

  const queryClient = useQueryClient();
  const [verifyPayment, setVerifyPayment] = useState("");
  // const [currentSubscription, setCurrentSubscription] = useState(null);
  // Get current user subscription status
  const { data: userProfile, isLoading: userProfileLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      let resp = await CaryBinApi.get("/auth/view-profile");
      return resp.data;
    },
  });

  const currentSubscription =
    userProfile?.data?.subscriptions?.[
      userProfile?.data?.subscriptions?.length - 1
    ];
  console.log("Current Subscription:", currentSubscription);
  const hasActiveSubscription = currentSubscription?.is_active;
  const isUpgrade =
    !hasActiveSubscription || currentView?.id !== currentSubscription?.id;

  // Get price values for comparison
  const currentPlanPrice =
    currentSubscription?.subscription_plan_prices?.[0]?.price ||
    currentSubscription?.plan_price_at_subscription ||
    0;
  const targetPlanPrice =
    currentView?.subscription_plan_prices?.[0]?.price || 0;

  // Determine if user is trying to downgrade
  const isDowngrade =
    hasActiveSubscription && currentPlanPrice > targetPlanPrice;

  // Debug logging
  console.log("SubscribeModal Debug:", {
    userProfile: userProfile?.data,
    currentSubscription,
    hasActiveSubscription,
    currentView,
    isUpgrade,
    subscriptionId: currentSubscription?.id,
    newPlanPriceId: currentView?.subscription_plan_prices?.[0]?.id,
    currentPlanPrice,
    targetPlanPrice,
    isDowngrade,
  });

  const payWithPaystack = ({ amount, payment_id }) => {
    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_API_KEY,
      email: carybinUser?.email,
      id: payment_id,
      amount: amount * 100,
      currency: "NGN",
      reference: payment_id,
      ref: payment_id,
      metadata: {
        custom_fields: [
          {
            display_name: carybinUser?.email,
            variable_name: carybinUser?.email,
            value: payment_id,
          },
        ],
      },
      callback: function (response) {
        console.log("💳 Step 2 completed - Payment successful:", response);
        console.log("🔄 Step 3: Starting payment verification...");
        setVerifyPayment(response?.reference);
        verifyPaymentMutate(
          {
            id: response?.reference,
          },
          {
            onSuccess: (verifyData) => {
              console.log(
                "✅ Step 3: Payment verified successfully!",
                verifyData,
              );
              console.log("🔄 Step 4: Refreshing subscription data...");
              setVerifyPayment("");

              // Invalidate subscription queries
              queryClient.invalidateQueries({
                queryKey: ["get-user-subscription"],
              });
              queryClient.invalidateQueries({
                queryKey: ["get-subscription"],
              });
              queryClient.invalidateQueries({
                queryKey: ["free-plan"],
              });
              queryClient.invalidateQueries({
                queryKey: ["user-profile"],
              });

              console.log("🎉 Subscription upgrade completed successfully!");

              // Call the Paystack success callback to update parent component
              if (onPaystackSuccess) {
                onPaystackSuccess();
              }

              onClose();
              if (refetch) refetch();
            },
            onError: (error) => {
              console.error("❌ Step 3 failed - Payment verification:", error);
              setVerifyPayment("");
            },
          },
        );
      },
      onClose: function () {
        alert("Payment window closed.");
      },
    });

    handler.openIframe();
    refetch();
  };

  // Loading Spinner Component
  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-purple-400 rounded-full animate-spin animate-reverse"></div>
      </div>
      <div className="mt-4 text-center">
        <p className="text-lg font-medium text-gray-700">
          Loading subscription details...
        </p>
        <p className="text-sm text-gray-500 mt-1">Please wait a moment</p>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white/95 backdrop-blur-md rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Show loading state while fetching user profile */}
          {userProfileLoading ? (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {currentView?.name}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaTimes className="text-gray-500" />
                </button>
              </div>
              <LoadingSpinner />
            </div>
          ) : (
            /* Main content - only show when data is loaded */
            <>
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {currentView?.name}
                      </h2>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FaTimes className="text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  {/* Show downgrade warning if applicable */}
                  {isDowngrade ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-xl text-red-500">
                          <FaBriefcase />
                        </span>
                        <span className="text-lg font-semibold text-red-700">
                          Cannot Switch to Lower Plan
                        </span>
                      </div>
                      <p className="text-sm text-red-700">
                        You cannot switch from your current plan (
                        <span className="font-semibold">
                          {currentSubscription?.name || "Current Plan"}
                        </span>
                        ) to a lower plan (
                        <span className="font-semibold">
                          {currentView?.name}
                        </span>
                        ). Please select a plan with a higher price than your
                        current plan.
                      </p>
                      <div className="mt-4 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-red-900">
                            Current Plan Price:
                          </span>
                          <span className="text-sm font-bold text-red-900">
                            ₦{new Intl.NumberFormat().format(currentPlanPrice)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-red-900">
                            Selected Plan Price:
                          </span>
                          <span className="text-sm font-bold text-red-900">
                            ₦{new Intl.NumberFormat().format(targetPlanPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-500">
                        {isUpgrade
                          ? `Are you sure you want to upgrade from ${currentSubscription?.name || "your current plan"} to ${currentView?.name}?`
                          : "Are you sure you want to subscribe?"}
                      </p>

                      {isUpgrade && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-blue-900">
                                Current Plan:
                              </span>
                              <span className="text-sm text-blue-800 font-semibold">
                                {currentSubscription?.name || "Free Plan"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-blue-900">
                                Upgrading to:
                              </span>
                              <span className="text-sm text-blue-800 font-semibold">
                                {currentView?.name}
                              </span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                              <span className="text-sm font-medium text-blue-900">
                                Price:
                              </span>
                              <span className="text-lg font-bold text-blue-900">
                                ₦
                                {new Intl.NumberFormat().format(
                                  currentView?.subscription_plan_prices?.[0]
                                    ?.price || 0,
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {!isUpgrade && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-green-900">
                              Plan Price:
                            </span>
                            <span className="text-lg font-bold text-green-900">
                              ₦
                              {new Intl.NumberFormat().format(
                                currentView?.subscription_plan_prices?.[0]
                                  ?.price || 0,
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={createPending || upgradePending || verifyPending}
                    className="px-6 py-2 cursor-pointer text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (isDowngrade) {
                        // Do nothing, button should be disabled
                        return;
                      }
                      if (isUpgrade) {
                        const upgradePayload = {
                          subscription_id: currentSubscription?.id,
                          new_plan_price_id:
                            currentView?.subscription_plan_prices[0]?.id,
                        };
                        console.log(
                          "🔄 Starting subscription upgrade flow:",
                          upgradePayload,
                        );
                        console.log("📊 Current plan details:", {
                          currentPlan: currentSubscription?.name,
                          currentPlanId: currentSubscription?.id,
                          targetPlan: currentView?.name,
                          targetPlanPrice:
                            currentView?.subscription_plan_prices[0]?.price,
                        });

                        upgradeSubscriptionMutate(upgradePayload, {
                          onSuccess: (upgradeResponse) => {
                            console.log(
                              "✅ Step 1: Upgrade initiated successfully:",
                              upgradeResponse,
                            );

                            const paymentId =
                              upgradeResponse?.data?.data?.payment_id;
                            const authUrl =
                              upgradeResponse?.data?.data?.authorization_url;

                            console.log("💰 Payment details:", {
                              paymentId,
                              authUrl,
                              amount:
                                currentView?.subscription_plan_prices[0]?.price,
                            });

                            if (paymentId) {
                              console.log(
                                "🚀 Step 2: Opening Paystack payment popup...",
                              );
                              payWithPaystack({
                                amount:
                                  +currentView?.subscription_plan_prices[0]
                                    ?.price,
                                payment_id: paymentId,
                              });
                            } else {
                              console.log(
                                "✅ No payment needed, upgrade completed directly",
                              );

                              // Call the Paystack success callback to update parent component
                              if (onPaystackSuccess) {
                                onPaystackSuccess();
                              }

                              onClose();
                              if (refetch) refetch();
                            }
                          },
                          onError: (error) => {
                            console.error(
                              "❌ Step 1 failed - Upgrade initiation:",
                              error,
                            );
                            // Modal will stay open so user can try again
                          },
                        });
                      } else {
                        createSubMutate(
                          {
                            email: carybinUser?.email,
                            plan_price_id:
                              currentView?.subscription_plan_prices[0]?.id,
                            payment_method: "PAYSTACK",
                            auto_renew: true,
                          },
                          {
                            onSuccess: (data) => {
                              onClose();
                              payWithPaystack({
                                amount:
                                  +currentView?.subscription_plan_prices[0]
                                    ?.price,
                                payment_id: data?.data?.data?.payment_id,
                              });

                              // Call the Paystack success callback for new subscriptions too
                              if (onPaystackSuccess) {
                                onPaystackSuccess();
                              }
                            },
                          },
                        );
                      }
                    }}
                    disabled={
                      createPending ||
                      upgradePending ||
                      verifyPending ||
                      isDowngrade
                    }
                    className={`px-6 py-2 rounded-lg hover:shadow-lg cursor-pointer duration-200 transition-all flex items-center space-x-2 bg-gradient-to-r hover:from-[#8036D3] from-[#9847FE] to-[#8036D3] text-white hover:to-[#6B2BB5] disabled:opacity-50 disabled:cursor-not-allowed font-medium min-w-[140px] justify-center`}
                  >
                    {isDowngrade ? (
                      "Cannot Downgrade"
                    ) : verifyPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Verifying...
                      </>
                    ) : createPending || upgradePending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Please wait...
                      </>
                    ) : isUpgrade ? (
                      "Upgrade Plan"
                    ) : (
                      "Subscribe"
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SubscriptionModal;
