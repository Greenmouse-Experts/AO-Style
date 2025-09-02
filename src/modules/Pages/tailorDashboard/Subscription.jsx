import { useState, useRef, useEffect, useMemo } from "react";
import { FaEllipsisH, FaCalendarAlt, FaBars, FaTh } from "react-icons/fa";
import { useFormik } from "formik";
import { useLocation } from "react-router-dom";
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
import SubscriptionModal from "./SubscribeModal";
import useGetUserSubscription from "../../../hooks/subscription/useGetUserSub";
import { useQuery } from "@tanstack/react-query";
import CaryBinApi from "../../../services/CarybinBaseUrl";

const Subscriptions = () => {
  const location = useLocation();
  const free_plan = useQuery({
    queryKey: ["free-plan"],
    queryFn: async () => {
      let resp = await CaryBinApi.get("/auth/view-profile");
      return resp.data;
    },
  });
  const [currentView, setCurrentView] = useState(null);

  const { isOpen, closeModal, openModal } = useModalState();

  const {
    isOpen: subIsOpen,
    closeModal: subCloseModal,
    openModal: subOpenModal,
  } = useModalState();

  const currUrl = location.pathname;
  const dropdownRef = useRef(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState();

  const [type, setType] = useState("Add");

  const initialValues = {
    code: newCategory?.code ?? "",
    type: newCategory?.type ?? "",
    value: newCategory?.value ?? "",
    start_date: newCategory?.start_date ?? "",
    end_date: newCategory?.end_date ?? "",
    usage_limit: newCategory?.usage_limit ?? "",
    user_limit: newCategory?.user_limit ?? "",
    min_purchase: newCategory?.min_purchase ?? "",
  };

  const [activeTab, setActiveTab] = useState("table");

  const { toastError } = useToast();

  const {
    handleSubmit,
    touched,
    errors,
    values,
    handleChange,
    setFieldValue,
    resetForm,
    // setFieldError,
  } = useFormik({
    initialValues: initialValues,
    validateOnChange: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (val) => {},
  });

  const toggleDropdown = (rowId) => {
    setOpenDropdown(openDropdown === rowId ? null : rowId);
  };

  const handleDropdownToggle = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const { data: businessDetails } = useGetBusinessDetails();

  console.log(businessDetails);

  const { queryParams, updateQueryParams } = useQueryParams({
    "pagination[limit]": 10,
    "pagination[page]": 1,
  });

  const { carybinUser } = useCarybinUserStore();

  console.log(carybinUser, "sub");

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
  console.log(subscriptionData);
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

  // Get the active plan as the last item in the subscriptions array
  const activePlan =
    free_plan.data?.data?.subscriptions &&
    free_plan.data?.data?.subscriptions.length > 0
      ? free_plan.data?.data?.subscriptions[
          free_plan.data?.data?.subscriptions.length - 1
        ]
      : undefined;

  // Handle Paystack success callback
  const handlePaystackSuccess = () => {
    console.log("🔄 Paystack success - refreshing subscription data...");
    refetch();
    free_plan.refetch();

    // Force a slight delay and additional refetch to ensure UI updates
    setTimeout(() => {
      refetch();
      free_plan.refetch();
      console.log("✅ Subscription data refreshed after upgrade");
    }, 1000);
  };

  const subscriptionRes = useMemo(
    () =>
      subscriptionData?.data
        ? subscriptionData?.data.map((details) => {
            // Determine if this plan is the active plan (last item)
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
    // update search params with undefined if debouncedSearchTerm is an empty string
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

  useUpdatedEffect(() => {
    // update search params with undefined if debouncedSearchTerm is an empty string
    updateQueryParams({
      q: debouncedSearchTerm.trim() || undefined,
      "pagination[page]": 1,
    });
  }, [debouncedSearchTerm]);

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
                      console.log(row, "sub");
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

  //   const totalPages = Math.ceil(
  //     data?.count / (queryParams["pagination[limit]"] ?? 10)
  //   );

  // Use the last item as the active plan
  const plan = activePlan;
  const is_free = plan?.name === "Free Plan" ? true : false;
  const plan_data = plan;

  // Debug logging to understand data structure
  console.log("DEBUG - User subscription data:", {
    subscription: activePlan,
    allPlans: subscriptionData?.data?.slice(0, 2), // First 2 plans for brevity
    planComparison: {
      userSubscriptionId: activePlan?.id,
      firstPlanId: subscriptionData?.data?.[0]?.id,
      userPlanId: activePlan?.subscription_plan_id,
    },
  });

  return (
    <div className="bg-white p-6  rounded-xl overflow-visible">
      {/* <>loading {JSON.stringify(free_plan.data)}</>*/}
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

      <div className="flex flex-wrap justify-between items-center pb-3  gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <h2 className="text-lg font-semibold">Subscriptions</h2>
        </div>

        <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center space-x-2 border border-gray-200 rounded-md p-1">
            <button
              className={`p-2 rounded ${
                activeTab === "table" ? "text-[#9847FE]" : "text-gray-600"
              }`}
              onClick={() => {
                setActiveTab("table");
                setType("Add");
              }}
            >
              <FaBars size={16} />
            </button>
            <button
              className={`p-2 rounded ${
                activeTab === "grid" ? "text-[#9847FE]" : "text-gray-600"
              }`}
              onClick={() => {
                setActiveTab("grid");
                setType("Add");
              }}
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

          {/* <button className="bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap">
            Sort: Newest First ▾
          </button> */}
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-4">All Subscription Plans</p>
      {activeTab === "table" ? (
        <>
          <ReusableTable
            loading={isPending}
            columns={columns}
            data={subscriptionRes}
          />
          {/*
          {!fabricData?.length && !isPending ? (
            <p className="flex-1 text-center text-sm md:text-sm">
              No subscription found.
            </p>
          ) : (
            <></>
          )}*/}
        </>
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
                        setCurrentView(row);
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
                {/* <div className="flex items-center justify-center space-x-2 mt-2">
                  <FaLayerGroup className="text-[#9847FE]" size={14} />
                  <span className="text-gray-600 text-sm">
                    {item.totalFabrics}
                  </span>
                </div> */}
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
      {isOpen && (
        <ViewSubscription onClose={closeModal} currentView={currentView} />
      )}
      {subIsOpen && (
        <SubscriptionModal
          refetch={() => {
            refetch();
            free_plan.refetch();
          }}
          onClose={subCloseModal}
          currentView={currentView}
          onPaystackSuccess={handlePaystackSuccess}
        />
      )}
    </div>
  );
};

export default Subscriptions;
