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

  const [queryString, setQueryString] = useState(queryParams.q);

  const debouncedSearchTerm = useDebounce(queryString ?? "", 1000);

  // Handle Paystack success callback
  const handlePaystackSuccess = () => {
    refetch();
    free_plan.refetch();
  };

  const subscriptionRes = useMemo(
    () =>
      subscriptionData?.data
        ? subscriptionData?.data.map((details) => {
            return {
              ...details,
              name: `${details?.name}`,
              status: `${
                details?.id === carybinUser?.subscriptions[0]?.plan_id
                  ? "Active"
                  : "Not-active"
              }`,

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
    [subscriptionData?.data],
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

                {row?.subscription_plan_prices[0]?.period === "free" ||
                carybinUser?.subscriptions[0]?.plan_id == row?.id ? (
                  <></>
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
                    Subscribe
                  </button>
                )}
              </div>
            )}
          </div>
        ),
      },
    ],
    [openDropdown],
  );

  //   const totalPages = Math.ceil(
  //     data?.count / (queryParams["pagination[limit]"] ?? 10)
  //   );

  const plan = free_plan.data?.data?.subscriptions[0];
  const is_free = plan?.name === "Free Plan" ? true : false;
  const plan_data = plan;

  return (
    <div className="bg-white p-6  rounded-xl overflow-visible">
      {/* <>loading {JSON.stringify(free_plan.data)}</>*/}
      <div className="py-6 border-b border-gray-200 mb-8 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="text-base font-medium text-gray-700">
            Current Plan:
          </div>
          <div className="font-bold text-xl text-gray-900">
            {is_free
              ? plan_data.name
              : free_plan.data?.data?.subscriptions[0]
                  ?.plan_name_at_subscription || "N/A"}
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {!is_free &&
            (free_plan.data?.data?.subscriptions[0]?.is_active ? (
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                Active
              </span>
            ) : (
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium">
                Inactive
              </span>
            ))}
          <span className="text-gray-500">
            |{" "}
            {formatDateStr(
              free_plan.data?.data?.subscriptions[0]?.created_at?.split(".")[0],
              "D/M/YYYY h:mm A",
            )}
          </span>
        </div>
        {is_free && (
          <p className="text-gray-600 text-sm">{plan_data.description}</p>
        )}
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
                      to={`.`}
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
          refetch={refetch}
          onClose={subCloseModal}
          currentView={currentView}
          onPaystackSuccess={handlePaystackSuccess}
        />
      )}
    </div>
  );
};

export default Subscriptions;
