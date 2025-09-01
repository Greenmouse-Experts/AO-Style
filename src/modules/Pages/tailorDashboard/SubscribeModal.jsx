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

  // Get current user subscription status
  const { data: userProfile } = useQuery({
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
  const hasActiveSubscription = currentSubscription?.is_active;
  const isUpgrade =
    hasActiveSubscription && currentView?.id !== currentSubscription?.id;

  // Debug logging
  console.log("SubscribeModal Debug:", {
    userProfile: userProfile?.data,
    currentSubscription,
    hasActiveSubscription,
    currentView,
    isUpgrade,
    subscriptionId: currentSubscription?.id,
    newPlanPriceId: currentView?.subscription_plan_prices?.[0]?.id,
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
          <div className="p-6 border-b border-gray-200">
            {" "}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                {/* <div className="p-2 bg-purple-100 rounded-lg">
                  <FaBriefcase className="text-purple-600" />
                </div> */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {/* {selectedJob.title} */}
                    {currentView?.name}
                  </h2>
                  {/* <p className="text-sm text-gray-500">Subscription Details</p> */}
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
              <p className="text-sm text-gray-500">
                {isUpgrade
                  ? `Are you sure you want to upgrade from ${currentSubscription?.subscription_plan_price?.subscription_plan?.name} to ${currentView?.name}?`
                  : "Are you sure you want to subscribe?"}
              </p>

              {isUpgrade && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Current Plan:</strong> {currentSubscription?.name}
                  </p>
                  <p className="text-sm text-blue-800">
                    <strong>New Plan:</strong> {currentView?.name}
                  </p>
                  <p className="text-sm text-blue-800">
                    <strong>Price:</strong> ₦
                    {new Intl.NumberFormat().format(
                      currentView?.subscription_plan_prices?.[0]?.price,
                    )}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={createPending || upgradePending || verifyPending}
                className="px-4 py-2 cursor-pointer text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (isUpgrade) {
                    const upgradePayload = {
                      subscription_id: currentSubscription?.id,
                      new_plan_price_id:
                        currentView?.subscription_plan_prices?.[0]?.id,
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
                              +currentView?.subscription_plan_prices[0]?.price,
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
                              +currentView?.subscription_plan_prices[0]?.price,
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
                disabled={createPending || upgradePending || verifyPending}
                className={`px-4 py-2 rounded-lg hover:shadow-lg cursor-pointer duration-200 transition-colors flex items-center space-x-2 bg-gradient-to-r hover:from-[#8036D3] from-[#9847FE] to-[#8036D3] text-white hover:to-[#6B2BB5] disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {verifyPending
                  ? "Verifying payment..."
                  : createPending || upgradePending
                    ? "Please wait..."
                    : isUpgrade
                      ? "Upgrade Plan"
                      : "Subscribe"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SubscriptionModal;
