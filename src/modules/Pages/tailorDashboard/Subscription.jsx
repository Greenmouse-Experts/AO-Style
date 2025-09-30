import { useState, useRef, useEffect, useMemo } from "react";
import {
  FaEllipsisH,
  FaCalendarAlt,
  FaBars,
  FaTh,
  FaTimes,
  FaBriefcase,
} from "react-icons/fa";
import { useFormik } from "formik";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ReusableTable from "../adminDashboard/components/ReusableTable";
import useQueryParams from "../../../hooks/useQueryParams";
import { formatDateStr, formatNumberWithCommas } from "../../../lib/helper";
import useDebounce from "../../../hooks/useDebounce";
import useUpdatedEffect from "../../../hooks/useUpdatedEffect";
import useToast from "../../../hooks/useToast";
import useGetBusinessDetails from "../../../hooks/settings/useGetBusinessDetails";
import { useModalState } from "../../../hooks/useModalState";
import ViewSubscription from "./ViewSubscription";
import { useCarybinUserStore } from "../../../store/carybinUserStore";
import useGetUserSubscription from "../../../hooks/subscription/useGetUserSub";
import useCreateSubscriptionPayment from "../../../hooks/subscription/useCreateSubscriptionPayment";
import useVerifySubPay from "../../../hooks/subscription/useVerifySubPay";
import useUpgradeSubscription from "../../../hooks/subscription/useUpgradeSubscription";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import CaryBinApi from "../../../services/CarybinBaseUrl";

const Subscriptions = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { carybinUser } = useCarybinUserStore();

  const free_plan = useQuery({
    queryKey: ["free-plan"],
    queryFn: async () => {
      let resp = await CaryBinApi.get("/auth/view-profile");
      return resp.data;
    },
  });

  const [currentView, setCurrentView] = useState(null);
  const [verifyPayment, setVerifyPayment] = useState("");

  const { isOpen, closeModal, openModal } = useModalState();
  const {
    isOpen: subIsOpen,
    closeModal: subCloseModal,
    openModal: subOpenModal,
  } = useModalState();

  const currUrl = location.pathname;
  const dropdownRef = useRef(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [activeTab, setActiveTab] = useState("table");

  const { toastError } = useToast();

  // Subscription mutation hooks
  const { isPending: createPending, mutate: createSubMutate } =
    useCreateSubscriptionPayment();
  const { isPending: verifyPending, mutate: verifyPaymentMutate } =
    useVerifySubPay();
  const { isPending: upgradePending, mutate: upgradeSubscriptionMutate } =
    useUpgradeSubscription();

  const toggleDropdown = (rowId) => {
    setOpenDropdown(openDropdown === rowId ? null : rowId);
  };

  const handleDropdownToggle = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const { data: businessDetails } = useGetBusinessDetails();

  const { queryParams, updateQueryParams } = useQueryParams({
    "pagination[limit]": 10,
    "pagination[page]": 1,
  });

  const {
    isPending,
    isLoading,
    refetch,
    isError,
    data: subscriptionData,
  } = useGetUserSubscription(
    {
      ...queryParams,
    },
    currUrl == "/fabric/subscription" ? "fabric-vendor" : "fashion-designer",
  );

  const [queryString, setQueryString] = useState(queryParams.q);
  const debouncedSearchTerm = useDebounce(queryString ?? "", 1000);

  // Get the active plan as the last item in the subscriptions array
  const activePlan =
    free_plan.data?.data?.subscriptions &&
    free_plan.data?.data?.subscriptions.length > 0
      ? free_plan.data?.data?.subscriptions[
          free_plan.data?.data?.subscriptions.length - 1
        ]
      : undefined;

  // Paystack payment handler
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
        console.log("💳 Payment successful:", response);
        setVerifyPayment(response?.reference);
        verifyPaymentMutate(
          {
            id: response?.reference,
          },
          {
            onSuccess: (verifyData) => {
              console.log("✅ Payment verified successfully!", verifyData);
              setVerifyPayment("");

              // Invalidate all subscription-related queries
              queryClient.invalidateQueries({
                queryKey: ["get-user-subscription"],
              });
              queryClient.invalidateQueries({ queryKey: ["get-subscription"] });
              queryClient.invalidateQueries({ queryKey: ["free-plan"] });
              queryClient.invalidateQueries({ queryKey: ["user-profile"] });

              // Refetch immediately
              refetch();
              free_plan.refetch();

              // Additional refetch after delay to ensure UI updates
              setTimeout(() => {
                refetch();
                free_plan.refetch();
              }, 1000);

              subCloseModal();
            },
            onError: (error) => {
              console.error("❌ Payment verification failed:", error);
              setVerifyPayment("");
            },
          },
        );
      },
      onClose: function () {
        console.log("Payment window closed.");
      },
    });

    handler.openIframe();
  };

  // Handle subscription/upgrade
  const handleSubscribe = (plan) => {
    const currentPlanPrice =
      activePlan?.subscription_plan_prices?.[0]?.price ||
      activePlan?.plan_price_at_subscription ||
      0;
    const targetPlanPrice = plan?.subscription_plan_prices?.[0]?.price || 0;

    // Check if user is trying to downgrade
    const isDowngrade =
      activePlan?.is_active && currentPlanPrice > targetPlanPrice;

    if (isDowngrade) {
      toastError(
        "You cannot downgrade to a lower plan. Please select a higher plan.",
      );
      return;
    }

    // Check if this is an upgrade or new subscription
    const isUpgrade =
      activePlan?.is_active && activePlan?.subscription_plan_id !== plan?.id;

    if (isUpgrade) {
      // Upgrade existing subscription
      const upgradePayload = {
        subscription_id: activePlan?.id,
        new_plan_price_id: plan?.subscription_plan_prices[0]?.id,
      };

      console.log("🔄 Starting subscription upgrade:", upgradePayload);

      upgradeSubscriptionMutate(upgradePayload, {
        onSuccess: (upgradeResponse) => {
          console.log("✅ Upgrade initiated successfully:", upgradeResponse);

          const paymentId = upgradeResponse?.data?.data?.payment_id;
          const authUrl = upgradeResponse?.data?.data?.authorization_url;

          if (paymentId) {
            console.log("🚀 Opening Paystack payment popup...");
            payWithPaystack({
              amount: targetPlanPrice,
              payment_id: paymentId,
            });
          } else {
            console.log("✅ No payment needed, upgrade completed directly");
            subCloseModal();
            refetch();
            free_plan.refetch();
          }
        },
        onError: (error) => {
          console.error("❌ Upgrade initiation failed:", error);
          toastError("Failed to upgrade subscription. Please try again.");
        },
      });
    } else {
      // New subscription
      createSubMutate(
        {
          email: carybinUser?.email,
          plan_price_id: plan?.subscription_plan_prices[0]?.id,
          payment_method: "PAYSTACK",
          auto_renew: true,
        },
        {
          onSuccess: (data) => {
            console.log("✅ Subscription created successfully:", data);
            payWithPaystack({
              amount: targetPlanPrice,
              payment_id: data?.data?.data?.payment_id,
            });
          },
          onError: (error) => {
            console.error("❌ Subscription creation failed:", error);
            toastError("Failed to create subscription. Please try again.");
          },
        },
      );
    }
  };

  const subscriptionRes = useMemo(
    () =>
      subscriptionData?.data
        ? subscriptionData?.data.map((details) => {
            const isActive =
              details?.id === activePlan?.subscription_plan_id ||
              details?.id ===
                activePlan?.subscription_plan_prices?.[0]
                  ?.subscription_plan_id ||
              details?.name === activePlan?.plan_name_at_subscription;

            return {
              ...details,
              name: `${details?.name}`,
              status: isActive ? "Active" : "Not-active",
              planValidity: `${
                details?.subscription_plan_prices[0]?.period == "free"
                  ? "Free"
                  : details?.subscription_plan_prices[0]?.period == "monthly"
                    ? "Monthly"
                    : details?.subscription_plan_prices[0]?.period ==
                        "quarterly"
                      ? "Quarterly"
                      : details?.subscription_plan_prices[0]?.period ==
                          "semi_annually"
                        ? "Semi Annually"
                        : "Yearly"
              }`,
              planDescription:
                details?.description.length > 15
                  ? `${details?.description.slice(0, 15)}...`
                  : details?.description,
              amount: ` ${formatNumberWithCommas(
                details?.subscription_plan_prices[0]?.price ?? 0,
              )}`,
              dateAdded: `${
                details?.created_at
                  ? formatDateStr(
                      details?.created_at.split(".").shift(),
                      "D/M/YYYY h:mm A",
                    )
                  : ""
              }`,
            };
          })
        : [],
    [subscriptionData?.data, activePlan],
  );

  useUpdatedEffect(() => {
    updateQueryParams({
      q: debouncedSearchTerm.trim() || undefined,
      "pagination[page]": 1,
    });
  }, [debouncedSearchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const columns = useMemo(
    () => [
      { label: "Plan Name", key: "name" },
      { label: "Plan Validity", key: "planValidity" },
      { label: "Plan Description", key: "planDescription" },
      { label: "Plan Price", key: "amount" },
      { label: "Date added", key: "dateAdded" },
      {
        label: "STATUS",
        key: "status",
        render: (status) => (
          <span
            className={`px-3 py-1 text-sm rounded-full ${
              status === "Active"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {status}
          </span>
        ),
      },
      {
        label: "Action",
        key: "action",
        render: (_, row) => (
          <div className="relative">
            <button
              className="bg-gray-100 cursor-pointer text-gray-500 px-3 py-1 rounded-md"
              onClick={() => toggleDropdown(row.id)}
            >
              <FaEllipsisH />
            </button>

            {openDropdown === row.id && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-md z-50 shadow-lg">
                <button
                  onClick={() => {
                    openModal();
                    setCurrentView(row);
                    setOpenDropdown(null);
                  }}
                  className="block cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-100 w-full"
                >
                  View plan
                </button>

                {row?.subscription_plan_prices[0]?.period === "free" ? (
                  <></>
                ) : activePlan?.subscription_plan_id == row?.id ||
                  activePlan?.subscription_plan_prices?.[0]
                    ?.subscription_plan_id == row?.id ||
                  activePlan?.plan_name_at_subscription == row?.name ? (
                  <span className="block px-4 py-2 text-green-600 text-sm font-medium">
                    Current Plan
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      subOpenModal();
                      setCurrentView(row);
                      setOpenDropdown(null);
                    }}
                    className="block cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-100 w-full"
                  >
                    {activePlan?.is_active ? "Upgrade Plan" : "Subscribe"}
                  </button>
                )}
              </div>
            )}
          </div>
        ),
      },
    ],
    [openDropdown, activePlan],
  );

  const plan = activePlan;
  const is_free = plan?.name === "Free Plan" ? true : false;
  const plan_data = plan;

  // Get current plan price for comparison
  const currentPlanPrice =
    activePlan?.subscription_plan_prices?.[0]?.price ||
    activePlan?.plan_price_at_subscription ||
    0;
  const targetPlanPrice =
    currentView?.subscription_plan_prices?.[0]?.price || 0;
  const isDowngrade =
    activePlan?.is_active && currentPlanPrice > targetPlanPrice;
  const isUpgrade =
    activePlan?.is_active &&
    activePlan?.subscription_plan_id !== currentView?.id;

  return (
    <div className="bg-white p-6 rounded-xl overflow-visible">
      <div
        data-theme="nord"
        className="card card-border bg-gradient-to-br from-primary/5 to-accent/5 mb-6 shadow-lg"
      >
        <div className="card-body">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-base-content/70 text-sm font-medium mb-1">
                  Current Plan
                </p>
                <h3 className="text-2xl font-bold text-primary">
                  {plan?.plan_name_at_subscription || plan?.name}
                </h3>
              </div>
            </div>

            {!is_free &&
              (plan?.is_active ? (
                <div className="badge badge-success badge-lg gap-2">
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="10" />
                  </svg>
                  Active
                </div>
              ) : (
                <div className="badge badge-error badge-lg gap-2">
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="10" />
                  </svg>
                  Inactive
                </div>
              ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-3 p-3 bg-base-200/50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-info/10 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-info"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs text-base-content/60 font-medium">
                  Started
                </p>
                <p className="text-sm font-semibold text-base-content">
                  {formatDateStr(
                    plan?.created_at?.split(".")[0],
                    "D/M/YYYY h:mm A",
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-base-200/50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs text-base-content/60 font-medium">
                  Product Limit
                </p>
                <p className="text-sm font-semibold text-base-content">
                  {plan?.max_quantity} products
                </p>
              </div>
            </div>
          </div>

          {is_free && (
            <div className="alert alert-primary">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="font-medium">Free Plan Benefits</p>
                <p className="text-sm opacity-80">{plan_data?.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap justify-between items-center pb-3 gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <h2 className="text-lg font-semibold">Subscriptions</h2>
        </div>

        <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center space-x-2 border border-gray-200 rounded-md p-1">
            <button
              className={`p-2 rounded ${
                activeTab === "table" ? "text-[#9847FE]" : "text-gray-600"
              }`}
              onClick={() => setActiveTab("table")}
            >
              <FaBars size={16} />
            </button>
            <button
              className={`p-2 rounded ${
                activeTab === "grid" ? "text-[#9847FE]" : "text-gray-600"
              }`}
              onClick={() => setActiveTab("grid")}
            >
              <FaTh size={16} />
            </button>
          </div>
          <input
            type="text"
            placeholder="Search subscription..."
            value={queryString}
            onChange={(evt) =>
              setQueryString(evt.target.value ? evt.target.value : undefined)
            }
            className="py-2 px-3 border border-gray-200 rounded-md outline-none text-sm w-full sm:w-64"
          />
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-4">All Subscription Plans</p>

      {activeTab === "table" ? (
        <ReusableTable
          loading={isPending}
          columns={columns}
          data={subscriptionRes}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subscriptionRes?.map((item) => (
            <div
              key={item.id}
              className="relative bg-white rounded-lg p-4 border border-gray-100 flex justify-between"
            >
              <div className="absolute top-3 right-3">
                <button
                  className="bg-gray-100 cursor-pointer text-gray-500 px-2 py-1 rounded-md"
                  onClick={() => handleDropdownToggle(item.id)}
                >
                  <FaEllipsisH size={14} />
                </button>

                {openDropdown === item.id && (
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-md z-10 border border-gray-200">
                    <button
                      onClick={() => {
                        openModal();
                        setCurrentView(item);
                        setOpenDropdown(null);
                      }}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      View Details
                    </button>
                  </div>
                )}
              </div>

              <div className="text-center mx-auto">
                <h3 className="text-[#1E293B] font-medium mb-2">{item.name}</h3>
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <FaCalendarAlt className="text-[#9847FE]" size={14} />
                  <span className="text-gray-600 text-sm">
                    {item.dateAdded}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Subscription Modal */}
      {isOpen && (
        <ViewSubscription onClose={closeModal} currentView={currentView} />
      )}

      {/* Subscribe/Upgrade Modal */}
      {subIsOpen && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
            onClick={subCloseModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white/95 backdrop-blur-md rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              {free_plan.isLoading ? (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                      {currentView?.name}
                    </h2>
                    <button
                      onClick={subCloseModal}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FaTimes className="text-gray-500" />
                    </button>
                  </div>
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-purple-400 rounded-full animate-spin"></div>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-lg font-medium text-gray-700">
                        Loading subscription details...
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Please wait a moment
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
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
                        onClick={subCloseModal}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <FaTimes className="text-gray-500" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="space-y-4">
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
                              {activePlan?.plan_name_at_subscription ||
                                activePlan?.name}
                            </span>
                            ) to a lower plan (
                            <span className="font-semibold">
                              {currentView?.name}
                            </span>
                            ). Please select a plan with a higher price than
                            your current plan.
                          </p>
                          <div className="mt-4 space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-red-900">
                                Current Plan Price:
                              </span>
                              <span className="text-sm font-bold text-red-900">
                                ₦
                                {new Intl.NumberFormat().format(
                                  currentPlanPrice,
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-red-900">
                                Selected Plan Price:
                              </span>
                              <span className="text-sm font-bold text-red-900">
                                ₦
                                {new Intl.NumberFormat().format(
                                  targetPlanPrice,
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-gray-500">
                            {isUpgrade
                              ? `Are you sure you want to upgrade from ${activePlan?.plan_name_at_subscription || activePlan?.name || "your current plan"} to ${currentView?.name}?`
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
                                    {activePlan?.plan_name_at_subscription ||
                                      activePlan?.name ||
                                      "Free Plan"}
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
                                      targetPlanPrice,
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
                                    targetPlanPrice,
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
                        onClick={subCloseModal}
                        disabled={
                          createPending || upgradePending || verifyPending
                        }
                        className="px-6 py-2 cursor-pointer text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (!isDowngrade) {
                            handleSubscribe(currentView);
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
      )}
    </div>
  );
};

export default Subscriptions;
