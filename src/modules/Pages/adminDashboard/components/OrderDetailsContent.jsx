import React, { useState, useRef, useEffect } from "react";
import ReusableTable from "./ReusableTable";
import { Link } from "react-router-dom";

const OrderDetailsPage = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [activeTab, setActiveTab] = useState(3);

  const statuses = [
    {
      label: "Order Placed",
      status: "completed",
      details: "Order placed on 12 Aug 2025 - 12:25 am",
    },
    {
      label: "Fabric Delivery",
      status: "completed",
      details: "Fabric delivered on 15 Aug 2025 - 9:00 am",
    },
    {
      label: "Tailoring",
      status: "completed",
      details: "Tailoring completed on 20 Aug 2025 - 3:00 pm",
    },
    {
      label: "Out for Delivery",
      status: "current",
      details: "Out for delivery on 22 Aug 2025 - 10:00 am",
    },
    {
      label: "Delivered",
      status: "pending",
      details: "Not yet delivered",
    },
  ];

  const getProgressWidth = () => {
    const completedCount = statuses.filter(
      (s) => s.status === "completed",
    ).length;
    return (completedCount / statuses.length) * 100;
  };

  // Order Details Table Data
  const orderDetailsData = [
    {
      id: 1,
      orderId: "ORD123SDW",
      customerName: "Chukka Uzo",
      amount: "250,000",
      orderStatus: "In-Progress",
      paymentStatus: "Paid",
    },
  ];

  const orderDetailsColumns = [
    { label: "S/N", key: "id" },
    { label: "Order ID", key: "orderId" },
    { label: "Customer Name", key: "customerName" },
    { label: "Amount", key: "amount" },
    {
      label: "Order Status",
      key: "orderStatus",
      render: (status) => <span className="text-blue-500">{status}</span>,
    },
    {
      label: "Payment Status",
      key: "paymentStatus",
      render: (status) => (
        <span
          className={status === "Paid" ? "text-green-500" : "text-gray-400"}
        >
          {status}
        </span>
      ),
    },
  ];

  // Financial Summary Table Data
  const financialSummaryData = [
    {
      id: 1,
      item: "Fabric Cost",
      amount: "N200,000",
      paymentStatus: "Paid",
      action: "",
    },
    {
      id: 2,
      item: "Fabric Delivery Fee",
      amount: "N2,000",
      paymentStatus: "Paid",
      action: "",
    },
    {
      id: 3,
      item: "Tailoring Fee",
      amount: "N120,000",
      paymentStatus: "Paid",
      action: "",
    },
    {
      id: 4,
      item: "Tailoring Delivery Fee",
      amount: "N9,000",
      paymentStatus: "Paid",
      action: "",
    },
    {
      id: 5,
      item: "Total Paid",
      amount: "N420,000",
      paymentStatus: "Paid",
      action: "",
    },
    {
      id: 6,
      item: "Platform Commission (10%)",
      amount: "N2,100",
      paymentStatus: "Paid",
      action: "",
    },
    {
      id: 7,
      item: "Tailor Payout",
      amount: "N188,000",
      paymentStatus: "Pending Payout",
      action: "",
    },
    {
      id: 8,
      item: "Fabric Vendor Payout",
      amount: "N188,000",
      paymentStatus: "Pending Payout",
      action: "",
    },
  ];

  const financialSummaryColumns = [
    { label: "S/N", key: "id" },
    { label: "Item", key: "item" },
    { label: "Amount", key: "amount" },
    {
      label: "Payment Status",
      key: "paymentStatus",
      render: (status) => (
        <span
          className={status === "Paid" ? "text-green-500" : "text-yellow-500"}
        >
          {status}
        </span>
      ),
    },
    {
      label: "Action",
      key: "action",
      render: () => (
        <button className="text-purple-500 text-sm hover:underline">
          View
        </button>
      ),
    },
  ];

  // Uploaded Images Table Data
  const uploadedImagesData = [
    {
      id: 1,
      uploadedBy: "Tailor/Designer",
      image: "Image Placeholder",
      uploadedOn: "09-06-2025",
    },
    {
      id: 2,
      uploadedBy: "Logistic Agent",
      image: "Image Placeholder",
      uploadedOn: "09-06-2025",
    },
  ];

  const uploadedImagesColumns = [
    { label: "S/N", key: "id" },
    { label: "Uploaded By", key: "uploadedBy" },
    {
      label: "Image",
      key: "image",
      render: () => <div className="w-12 h-12 bg-green-300 rounded-md"></div>,
    },
    { label: "Uploaded On", key: "uploadedOn" },
  ];

  // Pagination Logic
  const filteredOrderDetails = orderDetailsData.filter((order) =>
    Object.values(order).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  const filteredFinancialSummary = financialSummaryData.filter((item) =>
    Object.values(item).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  const filteredUploadedImages = uploadedImagesData.filter((item) =>
    Object.values(item).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrderDetails = filteredOrderDetails.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const currentFinancialSummary = filteredFinancialSummary.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const currentUploadedImages = filteredUploadedImages.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  const totalOrderDetailsPages = Math.ceil(
    filteredOrderDetails.length / itemsPerPage,
  );
  const totalFinancialSummaryPages = Math.ceil(
    filteredFinancialSummary.length / itemsPerPage,
  );
  const totalUploadedImagesPages = Math.ceil(
    filteredUploadedImages.length / itemsPerPage,
  );

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (
      currentPage <
      Math.max(
        totalOrderDetailsPages,
        totalFinancialSummaryPages,
        totalUploadedImagesPages,
      )
    ) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const toggleDropdown = (rowId) => {
    setOpenDropdown(openDropdown === rowId ? null : rowId);
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

  return (
    <div className="">
      <div className="bg-white p-6 rounded-lg mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Order Status
        </h2>
        <div className="relative mb-4">
          <div className="flex items-center justify-between">
            {statuses.map((status, index) => (
              <div
                key={index}
                className="flex-1 flex flex-col items-center cursor-pointer z-10"
                onClick={() => setActiveTab(index)}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white mb-2 transition-all duration-300 ${
                    status.status === "completed"
                      ? "bg-[#DF7D12]"
                      : status.status === "current"
                        ? "bg-[#DF7D12]"
                        : "bg-gray-300"
                  } ${
                    activeTab === index
                      ? "ring-2 ring-offset-2 ring-[#DF7D12]"
                      : ""
                  }`}
                >
                  {status.status === "completed" && (
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {status.status === "current" && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <span
                  className={`text-xs text-center transition-all duration-300 ${
                    status.status === "completed" || status.status === "current"
                      ? "text-[#DF7D12] font-medium"
                      : "text-gray-400"
                  } ${activeTab === index ? "font-semibold" : ""}`}
                >
                  {status.label}
                </span>
              </div>
            ))}
          </div>

          <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-10">
            <div
              className="h-full bg-[#DF7D12] transition-all duration-500"
              style={{ width: `${getProgressWidth()}%` }}
            ></div>
          </div>
        </div>

        {activeTab !== null && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              {statuses[activeTab]?.details}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Order Details
              </h3>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DF7D12] focus:border-transparent"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#DF7D12] focus:border-transparent"
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                </select>
              </div>
            </div>

            <ReusableTable
              data={currentOrderDetails}
              columns={orderDetailsColumns}
              searchTerm={searchTerm}
              currentPage={currentPage}
              totalPages={totalOrderDetailsPages}
              onPreviousPage={handlePreviousPage}
              onNextPage={handleNextPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>

          <div className="bg-white rounded-lg p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Financial Summary
            </h3>
            <ReusableTable
              data={currentFinancialSummary}
              columns={financialSummaryColumns}
              searchTerm={searchTerm}
              currentPage={currentPage}
              totalPages={totalFinancialSummaryPages}
              onPreviousPage={handlePreviousPage}
              onNextPage={handleNextPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>

          <div className="bg-white rounded-lg p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Uploaded Images
            </h3>
            <ReusableTable
              data={currentUploadedImages}
              columns={uploadedImagesColumns}
              searchTerm={searchTerm}
              currentPage={currentPage}
              totalPages={totalUploadedImagesPages}
              onPreviousPage={handlePreviousPage}
              onNextPage={handleNextPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Customer Information
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Customer Name:</span>
                <p className="font-medium">Chukka Uzo</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Email:</span>
                <p className="font-medium">chukka.uzo@example.com</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Phone:</span>
                <p className="font-medium">+234 801 234 5678</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Address:</span>
                <p className="font-medium">
                  123 Lagos Street, Victoria Island, Lagos State
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Order Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Order ID:</span>
                <span className="font-medium">ORD123SDW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Order Date:</span>
                <span className="font-medium">12 Aug 2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Total Amount:</span>
                <span className="font-medium">N420,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Payment Status:</span>
                <span className="text-green-500 font-medium">Paid</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {activeReviewModal && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Product Reviews</h3>
                <button
                  onClick={() => setActiveReviewModal(null)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>
              <ReviewList
                productId={activeReviewModal}
                className="max-h-96 overflow-y-auto"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailsPage;
