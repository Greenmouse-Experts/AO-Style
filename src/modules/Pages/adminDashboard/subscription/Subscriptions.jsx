import { useState, useRef, useEffect, useMemo } from "react";
import ReusableTable from "../components/ReusableTable";
import { FaEllipsisH } from "react-icons/fa";
import useCreateSubscription from "../../../../hooks/subscription";
import { useFormik } from "formik";
import useGetBusinessDetails from "../../../../hooks/settings/useGetBusinessDetails";
import useQueryParams from "../../../../hooks/useQueryParams";
import useGetSubscription from "../../../../hooks/subscription/useGetSubscription";
import { formatDateStr, formatNumberWithCommas } from "../../../../lib/helper";
import useDebounce from "../../../../hooks/useDebounce";
import useUpdatedEffect from "../../../../hooks/useUpdatedEffect";
import useEditSubscription from "../../../../hooks/subscription/useUpdateSubscription";
import useDeleteAdminFabric from "../../../../hooks/fabric/useDeleteAdminFabric";
import useDeleteSubscription from "../../../../hooks/subscription/useDeleteSubscription";
import useGetAdminBusinessDetails from "../../../../hooks/settings/useGetAdmnBusinessInfo";
import useToast from "../../../../hooks/useToast";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import CaryBinApi from "../../../../services/CarybinBaseUrl";

const AddSubscriptionModal = ({ isOpen, onClose, onAdd, newCategory }) => {
  const initialValues = {
    name: newCategory?.name ?? "",
    role: newCategory?.role ?? "",
    description: newCategory?.description ?? "",
    max_quantity: newCategory?.max_quantity ?? "",
    period: newCategory?.subscription_plan_prices[0]?.period ?? "",
    currency: newCategory?.subscription_plan_prices[0]?.currency ?? "",
    price: newCategory?.subscription_plan_prices[0]?.price ?? "",
  };

  const { isPending, createSubscriptionMutate } = useCreateSubscription();
  const { isPending: editIsPending, editSubscriptionMutate } =
    useEditSubscription(newCategory?.id);
  const { data: businessDetails } = useGetBusinessDetails();

  const { data: businessAdminDetails } = useGetAdminBusinessDetails();

  const modalRef = useRef(null);

  const { toastError } = useToast();

  const {
    handleSubmit,
    values,
    handleChange,
    resetForm,
    // setFieldError,
    setFieldValue,
  } = useFormik({
    initialValues: initialValues,
    validateOnChange: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (val) => {
      if (!navigator.onLine) {
        toastError("No internet connection. Please check your network.");
        return;
      }
      const updatedSubscription = {
        name: val.name,
        description: val.description,
        max_quantity: val.max_quantity,
        role: val.role,
        business_id: businessAdminDetails?.data?.id,
        subscription_plan_prices: [
          {
            price: val.price?.toString(),
            currency: val.currency,
            period: val.period,
          },
        ],
      };
      if (newCategory) {
        editSubscriptionMutate(updatedSubscription, {
          onSuccess: () => {
            onClose();
            resetForm();
          },
        });
      } else {
        createSubscriptionMutate(updatedSubscription, {
          onSuccess: () => {
            onClose();
            resetForm();
          },
        });
      }
    },
  });

  //   useEffect(() => {
  //     const handleClickOutside = (e) => {
  //       if (modalRef.current && !modalRef.current.contains(e.target)) {
  //         onClose();
  //       }
  //     };

  //     if (isOpen) {
  //       document.addEventListener("mousedown", handleClickOutside);
  //     }

  //     return () => {
  //       document.removeEventListener("mousedown", handleClickOutside);
  //     };
  //   }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Create Subscription Plan
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-4">User Type</label>
            <select
              required
              name="role"
              disabled={newCategory ? true : false}
              value={values.role}
              onChange={handleChange}
              className="w-full p-2 border border-[#CCCCCC] disabled:opacity-50 disabled:cursor-not-allowed outline-none rounded-lg"
            >
              <option value="" disabled>
                Select
              </option>

              <option value="fabric-vendor">Fabric Vendor</option>
              <option value="fashion-designer">Tailors/Designers</option>
              {/* <option value="Logistic Agent">Logistic Agent</option> */}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-4">Plan Name</label>
            <input
              type="text"
              name="name"
              value={values.name}
              onChange={handleChange}
              className="w-full p-2 border border-[#CCCCCC] outline-none rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-4">Plan Description</label>
            <textarea
              name="description"
              value={values.description}
              onChange={handleChange}
              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-4">
              Quantity (Per fabric)
            </label>
            <input
              type="number"
              name="max_quantity"
              value={values.max_quantity}
              onChange={handleChange}
              className="w-full p-2 border border-[#CCCCCC] outline-none rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-4">Plan Validity</label>
            <div className="flex">
              <select
                name="period"
                value={values.period}
                onChange={handleChange}
                className="mt-1 p-2 w-full border border-gray-300 rounded-r-md"
              >
                <option value="" disabled>
                  Select
                </option>
                <option value="free">Free</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="semi_annually">Semi Annually</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-4">Plan Price</label>
            <div className="flex">
              <select
                name="currency"
                value={values.currency}
                onChange={handleChange}
                className="mt-1 p-2 w-1/4 border border-gray-300 rounded-l-md"
              >
                <option value="" disabled>
                  Select
                </option>
                <option value="NGN">NGN</option>
                <option value="USD">USD</option>
              </select>
              <input
                type="number"
                name="price"
                value={values.price}
                onChange={handleChange}
                placeholder="20,000"
                className="mt-1 p-2 w-3/4 border border-gray-300 rounded-r-md"
                required
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              disabled={isPending || editIsPending}
              type="submit"
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-md text-sm font-light"
            >
              {isPending || editIsPending
                ? "Please wait..."
                : newCategory
                  ? "Update Subscription Plan"
                  : "Create Subscription Plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SubscriptionModal = ({ isOpen, onClose, subscription, onUpdate }) => {
  const [formData, setFormData] = useState(subscription);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const { toastError } = useToast();

  const handleSubmit = (e) => {
    if (!navigator.onLine) {
      toastError("No internet connection. Please check your network.");
      return;
    }
    e.preventDefault();
    onUpdate(formData.id, {
      ...formData,
      amount: `${formData.currency} ${formData.planPrice}`,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Edit Subscription Plan
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-4">User Type</label>
            <select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
            >
              <option value="Fabric Vendor">Fabric Vendor</option>
              <option value="Tailor">Tailor</option>
              <option value="Logistic Agent">Logistic Agent</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-4">Plan Name</label>
            <input
              type="text"
              name="planName"
              value={formData.planName}
              onChange={handleChange}
              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-4">Plan Description</label>
            <textarea
              name="planDescription"
              value={formData.planDescription}
              onChange={handleChange}
              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-4">
              Quantity (Per fabric)
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-4">Plan Validity</label>
            <div className="flex">
              <input
                type="number"
                name="planValidity"
                value={formData.planValidity}
                onChange={handleChange}
                className="w-1/2 p-4 border border-[#CCCCCC] outline-none rounded-lg rounded-l-md"
                required
              />
              <select
                name="planValidityType"
                value={formData.planValidityType}
                onChange={handleChange}
                className="w-1/2 p-4 border border-[#CCCCCC] outline-none rounded-lg"
              >
                <option value="Annually">Annually</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-4">Plan Price</label>
            <div className="flex">
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="p-4 w-1/4  border border-[#CCCCCC] outline-none rounded-lg rounded-l-md"
              >
                <option value="NGN">NGN</option>
                <option value="USD">USD</option>
              </select>
              <input
                type="text"
                name="planPrice"
                value={formData.planPrice}
                onChange={handleChange}
                placeholder="20,000"
                className="p-4 w-3/4  border border-[#CCCCCC] outline-none rounded-lg rounded-r-md"
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-4">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-light"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SubscriptionsPlansTable = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const dropdownRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  let [searchQuery, setSearchQuery] = useSearchParams();
  let tab = searchQuery.get("tab");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newCategory, setNewCategory] = useState();

  const { data: businessDetails } = useGetBusinessDetails();

  const { queryParams, updateQueryParams } = useQueryParams({
    "pagination[limit]": 10,
    "pagination[page]": 1,
  });

  const {
    isPending,
    isLoading,
    isError,
    data: subscriptionData,
  } = useGetSubscription(
    {
      ...queryParams,
    },
    businessDetails?.data?.id,
  );
  // const { data: subscriptionData, isFetching: isPending } = useQuery({
  //   queryKey: [tab],
  //   queryFn: async () => {
  //     let resp = await CaryBinApi.get(
  //       "/subscription-plan/fetch?role=fashion-designer",
  //     );
  //     return resp.data;
  //   },
  // });
  //

  const [data, setData] = useState([
    {
      id: 1,
      name: "Free",
      userType: "Fabric Vendor",
      planDescription: "Allows you to upload up to 50 unique materials...",
      amount: "N20,000",
      status: "Active",
      quantity: "50",
      planValidity: "1",
      planValidityType: "Annually",
      currency: "NGN",
      planPrice: "20,000",
    },
    {
      id: 2,
      name: "Bronze",
      userType: "Fabric Vendor",
      planDescription: "Allows you to upload up to 50 unique materials...",
      amount: "N20,000",
      status: "Active",
      quantity: "50",
      planValidity: "1",
      planValidityType: "Annually",
      currency: "NGN",
      planPrice: "20,000",
    },
    {
      id: 3,
      name: "Silver",
      userType: "Fabric Vendor",
      planDescription: "Allows you to upload up to 50 unique materials...",
      amount: "N20,000",
      status: "Active",
      quantity: "50",
      planValidity: "1",
      planValidityType: "Annually",
      currency: "NGN",
      planPrice: "20,000",
    },
    {
      id: 4,
      name: "Gold",
      userType: "Fabric Vendor",
      planDescription: "Allows you to upload up to 50 unique materials...",
      amount: "N20,000",
      status: "Active",
      quantity: "50",
      planValidity: "1",
      planValidityType: "Annually",
      currency: "NGN",
      planPrice: "20,000",
    },
  ]);

  const subscriptionRes = useMemo(
    () =>
      subscriptionData?.data
        ? subscriptionData?.data.map((details) => {
            return {
              ...details,
              name: `${details?.name}`,
              userType: `${
                details?.role == "fabric-vendor"
                  ? "Fabric Vendor"
                  : details?.role == "fashion-designer"
                    ? "Tailors/Designers"
                    : details?.role
              }`,
              planDescription:
                details?.description.length > 15
                  ? `${details?.description.slice(0, 15)}...`
                  : details?.description,
              amount: `${formatNumberWithCommas(
                details?.subscription_plan_prices[0]?.price,
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

  const toggleDropdown = (rowId) => {
    setOpenDropdown(openDropdown === rowId ? null : rowId);
  };

  const { isPending: deleteIsPending, deleteSubscriptionMutate } =
    useDeleteSubscription();

  const handleOpenAddModal = () => {
    setAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setAddModalOpen(false);
    setNewCategory(null);
  };

  const handleOpenEditModal = (subscription) => {
    setSelectedSubscription(subscription);
    setEditModalOpen(true);
    setOpenDropdown(null);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedSubscription(null);
  };

  const handleAddSubscription = (newSubscription) => {
    setData([...data, { id: data.length + 1, ...newSubscription }]);
  };

  const handleUpdateSubscription = (id, updatedSubscription) => {
    setData(
      data.map((item) =>
        item.id === id ? { ...item, ...updatedSubscription } : item,
      ),
    );
  };

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
      { label: "User Type", key: "userType" },
      { label: "Plan Description", key: "planDescription" },
      { label: "Plan Price", key: "amount" },
      { label: "Date added", key: "dateAdded" },

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
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-md z-10 shadow-lg">
                <button
                  className="block  cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                  onClick={() => {
                    handleOpenAddModal();
                    setOpenDropdown(null);
                    setNewCategory(row);
                  }}
                >
                  View/Edit Plan
                </button>
                <button
                  onClick={() => {
                    setNewCategory(row);
                    setIsAddModalOpen(true);
                    setOpenDropdown(null);
                  }}
                  className="block  cursor-pointer px-4 py-2 text-red-500 hover:bg-red-100 w-full text-left"
                >
                  Remove Plan
                </button>
              </div>
            )}
          </div>
        ),
      },
    ],
    [openDropdown],
  );

  const filteredData = data.filter((subscription) =>
    Object.values(subscription).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const [queryString, setQueryString] = useState(queryParams.q);

  const debouncedSearchTerm = useDebounce(queryString ?? "", 1000);

  useUpdatedEffect(() => {
    // update search params with undefined if debouncedSearchTerm is an empty string
    updateQueryParams({
      q: debouncedSearchTerm.trim() || undefined,
      "pagination[page]": 1,
    });
  }, [debouncedSearchTerm]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(
    subscriptionData?.count / (queryParams["pagination[limit]"] ?? 10),
  );

  console.log(totalPages);

  const new_data = subscriptionRes.filter((item) => {
    if (tab == "vendor") return (item.userType = "Fabric Vendor");
    return item.userType == "Tailors/Designers";
  });

  return (
    <div className="bg-white p-6 rounded-xl overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Subscriptions Plans</h2>

        <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
          <input
            type="text"
            placeholder="Search..."
            value={queryString}
            onChange={(evt) =>
              setQueryString(evt.target.value ? evt.target.value : undefined)
            }
            className="py-2 px-3 border border-gray-200 rounded-md outline-none text-sm w-full sm:w-64"
          />
          {/* <button className="bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap">
            Filter ▾
          </button> */}
          {/* <button className="bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap">
            Report ▾
          </button> */}
          {/* <button className="bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap">
            Bulk Action ▾
          </button> */}
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-light whitespace-nowrap"
            onClick={handleOpenAddModal}
          >
            + Add a New Subscription Plan
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-4">Created Subscription plan</p>
      <div className=" *:cusor-pointer gap-2 flex items-center">
        <button
          onClick={() => {
            searchQuery.delete("tab");
            setSearchQuery(searchQuery);
          }}
          className={`${tab !== "vendor" ? "border-purple-600" : "border-transparent"} p-2 border-b-2 `}
        >
          Tailor
        </button>
        <button
          onClick={() => {
            setSearchQuery((prev) => ({
              ...Object.fromEntries(prev),
              tab: "vendor",
            }));
          }}
          className={`${tab == "vendor" ? "border-purple-600" : "border-transparent"} p-2 border-b-2 `}
        >
          Vendor
        </button>
      </div>
      <ReusableTable loading={isPending} columns={columns} data={new_data} />
      {subscriptionRes?.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center">
            <p className="text-sm text-gray-600">Items per page: </p>
            <select
              value={queryParams["pagination[limit]"] || 10}
              onChange={(e) =>
                updateQueryParams({
                  "pagination[limit]": +e.target.value,
                })
              }
              className="py-2 px-3 border border-gray-200 ml-2 rounded-md outline-none text-sm w-auto"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => {
                updateQueryParams({
                  "pagination[page]": +queryParams["pagination[page]"] - 1,
                });
              }}
              disabled={(queryParams["pagination[page]"] ?? 1) == 1}
              className="px-3 py-1 rounded-md bg-gray-200"
            >
              ◀
            </button>
            <button
              onClick={() => {
                updateQueryParams({
                  "pagination[page]": +queryParams["pagination[page]"] + 1,
                });
              }}
              disabled={(queryParams["pagination[page]"] ?? 1) == totalPages}
              className="px-3 py-1 rounded-md bg-gray-200"
            >
              ▶
            </button>
          </div>
        </div>
      )}
      <AddSubscriptionModal
        isOpen={addModalOpen}
        onClose={handleCloseAddModal}
        onAdd={handleAddSubscription}
        newCategory={newCategory}
      />
      {selectedSubscription && (
        <SubscriptionModal
          isOpen={editModalOpen}
          onClose={handleCloseEditModal}
          subscription={selectedSubscription}
          onUpdate={handleUpdateSubscription}
        />
      )}

      {isAddModalOpen && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm"
          onClick={() => {
            setIsAddModalOpen(false);
          }}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <h3 className="text-lg font-semibold mb-4 -mt-7">
              {"Delete Product"}
            </h3>
            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                deleteSubscriptionMutate(
                  {
                    id: newCategory?.id,
                  },
                  {
                    onSuccess: () => {
                      setIsAddModalOpen(false);
                      setNewCategory(null);
                    },
                  },
                );
              }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Are you sure you want to delete {newCategory?.name}
              </label>
              <div className="flex w-full justify-end gap-4 mt-6">
                <button
                  className="mt-6 cursor-pointer w-full bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-3 text-sm rounded-md"
                  //   className="bg-gray-300 hover:bg-gray-400 text-gray-800 w-full rounded-md"
                  onClick={() => {
                    setIsAddModalOpen(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteIsPending}
                  className="mt-6 cursor-pointer w-full bg-gradient text-white px-4 py-3 text-sm rounded-md"
                >
                  {deleteIsPending ? "Please wait..." : "Delete Subscription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsPlansTable;
