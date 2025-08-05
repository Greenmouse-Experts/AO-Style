import React, { useState, useEffect, useMemo, useRef } from "react";
import ReusableTable from "../components/ReusableTable";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Shirt,
  Wallet,
} from "lucide-react";
import useGetUser from "../../../../hooks/user/useGetSingleUser";
import Loader from "../../../../components/ui/Loader";
import { formatDateStr, formatNumberWithCommas } from "../../../../lib/helper";
import useGetFabricProduct from "../../../../hooks/fabric/useGetFabric";
import useGetAdminFabricProduct from "../../../../hooks/fabric/useGetAdminFabricProduct";
import useUpdateAdminFabric from "../../../../hooks/fabric/useUpdateAdminFabric";
import { FaEllipsisH } from "react-icons/fa";
import useDebounce from "../../../../hooks/useDebounce";
import useUpdatedEffect from "../../../../hooks/useUpdatedEffect";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { CSVLink } from "react-csv";
import useDeleteAdminFabric from "../../../../hooks/fabric/useDeleteAdminFabric";
import useToast from "../../../../hooks/useToast";
import useFetchVendorOrders from "../../../../hooks/order/useAdminFetchVendorOrders";

const catalogData = [
  {
    id: "1",
    thumbnail: "https://randomuser.me/api/portraits/thumb/men/1.jpg",
    styleName: "D4 Agbada",
    category: "Agbada",
    sewingTime: "7 Days",
    price: "₦105,000",
    status: "Active",
  },
  {
    id: "2",
    thumbnail: "https://randomuser.me/api/portraits/thumb/men/2.jpg",
    styleName: "D4 Agbada",
    category: "Agbada",
    sewingTime: "7 Days",
    price: "₦105,000",
    status: "Active",
  },
  {
    id: "3",
    thumbnail: "https://randomuser.me/api/portraits/thumb/men/3.jpg",
    styleName: "D4 Agbada",
    category: "Agbada",
    sewingTime: "7 Days",
    price: "₦105,000",
    status: "Unpublished",
  },
  {
    id: "4",
    thumbnail: "https://randomuser.me/api/portraits/thumb/men/4.jpg",
    styleName: "D4 Agbada",
    category: "Agbada",
    sewingTime: "7 Days",
    price: "₦105,000",
    status: "Published",
  },
];

const ordersData = [
  {
    id: "1",
    orderId: "EWREI12324NH",
    customer: "Frank Samuel",
    styleName: "Native Agbada",
    status: "Active",
    date: "12/06/25",
    total: "₦105,000",
  },
  {
    id: "2",
    orderId: "EWREI12324NH",
    customer: "Frank Samuel",
    styleName: "Native Agbada",
    status: "Completed",
    date: "12/06/25",
    total: "₦105,000",
  },
  {
    id: "3",
    orderId: "EWREI12324NH",
    customer: "Frank Samuel",
    styleName: "Native Agbada",
    status: "Cancelled",
    date: "12/06/25",
    total: "₦105,000",
  },
  {
    id: "4",
    orderId: "EWREI12324NH",
    customer: "Frank Samuel",
    styleName: "Native Agbada",
    status: "Ongoing",
    date: "12/06/25",
    total: "₦105,000",
  },
];

const ViewFabric = () => {
  const { tailorId } = useParams();

  const { toastError } = useToast();

  const { isPending: deleteAdminIsPending, deleteAdminFabricMutate } =
    useDeleteAdminFabric();

  const { isPending, data } = useGetUser(tailorId);

  const userData = data?.data?.user;

  const businessData = data?.data?.business;

  console.log(businessData?.id);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const [newCategory, setNewCategory] = useState();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [status, setStatus] = useState(undefined);

  const [queryString, setQueryString] = useState("");

  const debouncedSearchTerm = useDebounce(queryString ?? "", 1000);

  const { data: getAllFabricFabricData, isPending: adminProductIsPending } =
    useGetAdminFabricProduct({
      business_id: businessData?.id,
      "pagination[page]": currentPage,
      "pagination[limit]": pageSize,
      status,
      q: debouncedSearchTerm.trim() || undefined,
    });

  console.log(getAllFabricFabricData, "fabricdata");

  const { data: getAllFabricData } = useGetFabricProduct({
    type: "FABRIC",
    id: businessData?.id,
  });

  const { isPending: updateAdminIsPending, updateAdminFabricMutate } =
    useUpdateAdminFabric();

  console.log(getAllFabricData, "sall fabric");

  const [catalogFilter, setCatalogFilter] = useState("all");
  const [ordersFilter, setOrdersFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const dropdownRef = useRef(null);

  const [catalogPage, setCatalogPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const itemsPerPage = 4;

  // Filter Catalog Data
  const filteredCatalog = catalogData.filter((item) => {
    if (catalogFilter === "all") return true;
    if (catalogFilter === "published") return item.status === "Published";
    if (catalogFilter === "unpublished") return item.status === "Unpublished";
    return true;
  });

  // Filter Orders Data
  const filteredOrders = ordersData.filter(
    (order) =>
      (ordersFilter === "all" || order.status.toLowerCase() === ordersFilter) &&
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const columns = useMemo(
    () => [
      { label: "SKU", key: "sku" },
      { label: "Product Name", key: "name" },
      {
        label: "Image",
        key: "image",
        render: (image, row) => (
          <div>
            {row?.fabric?.photos[0] ? (
              <img
                src={row?.fabric?.photos[0]}
                alt="product"
                className="w-10 h-10 rounded"
              />
            ) : (
              <div className="w-10 h-10 rounded bg-gray-300 flex items-center justify-center font-medium text-white">
                {row?.name?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
          </div>
        ),
      },
      { label: "Category", key: "category" },
      { label: "Price", key: "price" },
      { label: "Qty", key: "qty" },
      {
        label: "Status",
        key: "status",
        render: (status) => (
          <span
            className={`px-3 py-1 text-sm rounded-full ${
              status === "PUBLISHED"
                ? "bg-green-100 text-green-700"
                : status === "Cancelled"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
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
          <div className="relative" ref={dropdownRef}>
            <button
              className="text-gray-500 px-3 py-1 cursor-pointer rounded-md"
              onClick={() => toggleDropdown(row.id)}
            >
              <FaEllipsisH />
            </button>
            {openDropdown === row.id && (
              <div className="absolute cursor-pointer right-0 mt-2 w-40 bg-white rounded-md z-10">
                {row?.status === "DRAFT" ? (
                  <button
                    onClick={() => {
                      updateAdminFabricMutate(
                        {
                          id: row?.id,
                          product: {
                            name: row?.name,
                            sku: row?.sku,
                            category_id: row?.category_id,
                            status: "PUBLISHED",
                            approval_status: "PUBLISHED",
                          },
                        },
                        {
                          onSuccess: () => {
                            setOpenDropdown(null);
                          },
                        },
                      );
                    }}
                    className="block cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-100 w-full"
                  >
                    {updateAdminIsPending ? "Please wait" : "Publish Product"}
                  </button>
                ) : null}
                {row?.status === "PUBLISHED" ? (
                  <button
                    onClick={() => {
                      updateAdminFabricMutate(
                        {
                          id: row?.id,
                          product: {
                            name: row?.name,
                            sku: row?.sku,
                            category_id: row?.category_id,
                            status: "DRAFT",
                            approval_status: "DRAFT",
                          },
                        },
                        {
                          onSuccess: () => {
                            setOpenDropdown(null);
                          },
                        },
                      );
                    }}
                    className="block cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-100 w-full"
                  >
                    {updateAdminIsPending ? "Please wait" : "Draft Product"}
                  </button>
                ) : null}
                <Link
                  state={{ info: row }}
                  to={"/admin/fabric/edit-product"}
                  className="block cursor-pointer text-center px-4 py-2 text-gray-700 hover:bg-gray-100 w-full"
                >
                  {"View Product"}
                </Link>
                <button
                  onClick={() => {
                    setNewCategory(row);
                    setIsAddModalOpen(true);
                    setOpenDropdown(null);
                  }}
                  className="block cursor-pointer px-4 py-2 text-red-500 hover:bg-red-100 w-full"
                >
                  Remove Product
                </button>
              </div>
            )}
          </div>
        ),
      },
    ],
    [openDropdown, toggleDropdown],
  );

  const [queryOrderString, setQueryOrderString] = useState("");

  const debouncedOrderSearchTerm = useDebounce(queryOrderString ?? "", 1000);

  const [orderCurrentPage, setOrderCurrentPage] = useState(1);
  const [orderPageSize] = useState(10);

  const [orderStatus, setOrderStatus] = useState(undefined);

  const { data: fetchVendorOrders, isPending: fetchIsPending } =
    useFetchVendorOrders({
      business_id: businessData?.id,
      "pagination[page]": orderCurrentPage,
      "pagination[limit]": orderPageSize,
      status: orderStatus,
      q: debouncedOrderSearchTerm.trim() || undefined,
      role: "fashion-designer",
      user_id: tailorId,
    });

  const updatedColumn = useMemo(
    () => [
      { label: "Product", key: "product" },
      { label: "Amount", key: "amount" },
      //   { label: "Location", key: "location" },
      { label: "Order Date", key: "dateAdded" },
      {
        label: "Status",
        key: "status",
        render: (status) => (
          <span
            className={`px-3 py-1 text-sm rounded-full ${
              status === "Ongoing"
                ? "bg-yellow-100 text-yellow-700"
                : status === "Cancelled"
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
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
              onClick={() =>
                setOpenDropdown(openDropdown === row.id ? null : row.id)
              }
              className="px-2 py-1 cursor-pointer rounded-md"
            >
              •••
            </button>
            {openDropdown === row.id && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-md z-10">
                <Link
                  to={`/admin/fabric/orders/orders-details?id=${row.order_id}`}
                >
                  <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                    View Detail
                  </button>
                </Link>
                <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                  Cancel Order
                </button>
                <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                  Track Order
                </button>
              </div>
            )}
          </div>
        ),
      },
    ],
    [openDropdown],
  );

  const fabricOrderData = useMemo(
    () =>
      fetchVendorOrders?.data
        ? fetchVendorOrders?.data.map((details) => {
            return {
              ...details,
              transactionId: `${details?.payment?.transaction_id}`,
              customer:
                details?.user?.email?.length > 15
                  ? `${details?.user?.email.slice(0, 15)}...`
                  : details?.user?.email,
              product:
                details?.product?.name?.length > 15
                  ? `${details?.product?.name?.slice(0, 15)}...`
                  : details?.product?.name,
              amount: `${formatNumberWithCommas(
                details?.order?.total_amount ?? 0,
              )}`,

              status: `${details?.order?.status}`,
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
    [fetchVendorOrders?.data],
  );

  const ordersColumns = [
    { label: "S/N", key: "id" },
    { label: "ORDER ID", key: "orderId" },
    { label: "CUSTOMER", key: "customer" },
    { label: "STYLE NAME", key: "styleName" },
    {
      label: "STATUS",
      key: "status",
      render: (status) => (
        <span
          className={`px-3 py-1 text-sm rounded-full ${
            status === "Ongoing"
              ? "bg-yellow-100 text-yellow-700"
              : status === "Cancelled"
                ? "bg-red-100 text-red-700"
                : status === "Completed"
                  ? "bg-green-100 text-green-700"
                  : "bg-green-100 text-green-700"
          }`}
        >
          {status}
        </span>
      ),
    },
    { label: "DATE", key: "date" },
    { label: "TOTAL", key: "total" },
    {
      label: "ACTION",
      key: "action",
      render: (_, row) => (
        <div className="relative">
          <button
            onClick={() =>
              setOpenDropdown(
                openDropdown === `order-${row.id}` ? null : `order-${row.id}`,
              )
            }
            className="px-2 py-1 cursor-pointer rounded-md text-gray-600"
          >
            •••
          </button>
          {openDropdown === `order-${row.id}` && (
            <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-md z-10">
              <Link to={`/customer/orders/orders-details/${row.id}`}>
                <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                  View Details
                </button>
              </Link>
              <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                Cancel Order
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  const customerColumns = React.useMemo(
    (val) => [
      {
        label: "FULL NAME",
        key: "fullName",
        render: (_, row) => (
          <div className="flex items-center gap-3">
            {row.profile ? (
              <img
                src={row.profile}
                alt="profile"
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-lg font-medium text-white">
                {row?.fullName?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
            <span>{row.fullName}</span>
          </div>
        ),
      },
      {
        label: "KYC",
        key: "kyc",
        render: (kyc, row) => (
          <Link
            state={{ info: row.id }}
            to={`/admin/fabric-vendor/view?tab=personal`}
          >
            <span className="text-purple-600 cursor-pointer hover:underline">
              {kyc}
            </span>
          </Link>
        ),
      },

      { label: "EMAIL ADDRESS", key: "email" },
      { label: "PHONE NUMBER", key: "phone" },
      { label: "ADDRESS", key: "address" },
      { label: "DATE JOINED", key: "dateJoined" },
      {
        label: "ACTION",
        key: "action",
        render: (_, row) => (
          <div className="dropdown-menu">
            <button
              onClick={() =>
                setOpenDropdown(
                  openDropdown === `customer-${row.id}`
                    ? null
                    : `customer-${row.id}`,
                )
              }
              className="px-2 py-1 z-[9999] cursor-pointer rounded-md text-gray-600"
            >
              •••
            </button>
            {openDropdown === `customer-${row.id}` && (
              <div className="absolute right-2 mt-2 w-40 bg-white shadow-md rounded-md z-10">
                <Link
                  state={{ info: row.id }}
                  to={`/admin/fabric-vendor/view?tab=personal`}
                >
                  <button className="block cursor-pointer w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                    View Details
                  </button>
                </Link>
                <Link
                  state={{ info: row.id }}
                  to={`/admin/fabric-vendor/view?tab=personal`}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Edit User
                </Link>
              </div>
            )}
          </div>
        ),
      },
    ],
    [openDropdown, businessData],
  );

  const FabricData = useMemo(
    () =>
      getAllFabricFabricData?.data
        ? getAllFabricFabricData?.data?.map((details) => {
            return {
              ...details,
              category_id: `${details?.category?.id ?? ""}`,
              name: `${details?.name ?? ""}`,
              category: `${details?.category?.name ?? ""}`,
              qty: `${details?.fabric?.quantity ?? ""}`,
              price: `${formatNumberWithCommas(details?.price ?? 0)}`,
              created_at: `${
                details?.created_at
                  ? formatDateStr(details?.created_at.split(".").shift())
                  : ""
              }`,
            };
          })
        : [],
    [getAllFabricFabricData],
  );

  const customerData = React.useMemo(
    () => [
      {
        ...userData,
        ...businessData,
        id: userData?.id ?? "",
        fullName: userData?.name ?? "",
        profile: userData?.profile?.profile_picture ?? null,
        kyc: "See KYC",
        email: userData?.email ?? "",
        phone: userData?.phone ?? "",
        address: userData?.profile?.address ?? "",
        dateJoined: userData?.created_at
          ? formatDateStr(userData?.created_at.split(".").shift())
          : "",
      },
    ],
    [userData, businessData],
  );

  // Pagination for Catalog
  const catalogTotalPages = Math.ceil(filteredCatalog.length / itemsPerPage);
  const catalogStartIndex = (catalogPage - 1) * itemsPerPage;
  const catalogCurrentItems = filteredCatalog.slice(
    catalogStartIndex,
    catalogStartIndex + itemsPerPage,
  );

  // Pagination for Orders
  const ordersTotalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const ordersStartIndex = (ordersPage - 1) * itemsPerPage;
  const ordersCurrentItems = filteredOrders.slice(
    ordersStartIndex,
    ordersStartIndex + itemsPerPage,
  );

  const navigate = useNavigate();

  // Reset page when filter changes
  useEffect(() => {
    setCatalogPage(1);
  }, [catalogFilter]);

  useEffect(() => {
    setOrdersPage(1);
  }, [ordersFilter]);

  const handleExport = (e) => {
    const value = e.target.value;
    if (value === "excel") exportToExcel();
    if (value === "pdf") exportToPDF();
    if (value === "csv") document.getElementById("csvDownload").click();
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(FabricData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "FabricProducts.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["SKU", "Product Name", "Category", "Price", "Qty", "Status"]],
      body: FabricData?.map((row) => [
        row.sku,
        row.name,
        row.category,
        row.qty,
        row.status,
      ]),
      headStyles: {
        fillColor: [209, 213, 219],
        textColor: [0, 0, 0],
        halign: "center",
        valign: "middle",
        fontSize: 10,
      },
    });
    doc.save("FabricProducts.pdf");
  };

  // Close dropdown when clicking outside
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     // Only close if the click is outside any dropdown or dropdown button
  //     if (
  //       !event.target.closest(".dropdown-menu") &&
  //       !event.target.closest(".dropdown-trigger")
  //     ) {
  //       setOpenDropdown(null);
  //     }
  //   };
  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => document.removeEventListener("mousedown", handleClickOutside);
  // }, []);
  if (isPending) {
    return (
      <div className="m-auto flex h-[80vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <div className="">
        <button
          onClick={() => {
            navigate("/admin/fabric-vendor");
          }}
          className="bg-gray-100 cursor-pointer text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap"
        >
          ◀ Back
        </button>

        {/* Customer Info Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">
              View Fabric Vendor:{" "}
              <span className="text-purple-600 font-medium">
                {userData?.name}
              </span>
            </h2>
            {businessData?.kyc?.is_approved ? (
              <p className="text-sm font-medium text-gray-600">
                KYC:{" "}
                <span className="text-green-600 font-medium">Approved</span>
              </p>
            ) : (
              <></>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {/* Orders Card */}
            <div className="bg-white p-4 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="42"
                  height="41"
                  viewBox="0 0 42 41"
                  fill="none"
                >
                  <rect
                    x="0.785156"
                    y="0.308594"
                    width="40.2838"
                    height="40.2838"
                    rx="8.95195"
                    fill="#FFCC91"
                    fill-opacity="0.16"
                  />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M25.1351 29.309H17.3508C14.4915 29.309 12.2979 28.2762 12.9209 24.1194L13.6465 18.4861C14.0305 16.412 15.3535 15.6182 16.5144 15.6182H26.0057C27.1836 15.6182 28.4298 16.4717 28.8736 18.4861L29.5991 24.1194C30.1283 27.8067 27.9945 29.309 25.1351 29.309Z"
                    stroke="#130F26"
                    stroke-width="1.67849"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M25.264 15.4135C25.264 13.1885 23.4602 11.3848 21.2352 11.3848V11.3848C20.1638 11.3803 19.1347 11.8027 18.3755 12.5587C17.6162 13.3148 17.1894 14.3421 17.1895 15.4135V15.4135"
                    stroke="#130F26"
                    stroke-width="1.67849"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M24.0008 19.6123H23.9582"
                    stroke="#130F26"
                    stroke-width="1.67849"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M18.5633 19.6123H18.5207"
                    stroke="#130F26"
                    stroke-width="1.67849"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <button className="text-sm text-gray-500 px-2 py-1 bg-gray-100 rounded-md">
                  This Week ▼
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-3 mt-4">
                    All Orders
                  </p>
                  <p className="text-lg font-semibold text-gray-800">
                    450{" "}
                    <span className="text-red-500 text-sm font-normal">
                      -20%
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-3 mt-4">
                    Pending
                  </p>
                  <p className="text-lg font-semibold text-gray-800">5</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-3 mt-4">
                    Completed
                  </p>
                  <p className="text-lg font-semibold text-gray-800">320</p>
                </div>
              </div>
            </div>

            {/* Catalog Card */}
            <div className="bg-white p-4 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="41"
                  height="41"
                  viewBox="0 0 41 41"
                  fill="none"
                >
                  <rect
                    x="0.126953"
                    y="0.308594"
                    width="40.2838"
                    height="40.2838"
                    rx="8.95195"
                    fill="#91A0FF"
                    fill-opacity="0.25"
                  />
                  <path
                    d="M22.5846 10C22.5846 10 21.4894 10.3846 19.7692 10.3846C18.049 10.3846 16.9538 10 16.9538 10C16.7808 10.0001 16.609 10.0293 16.4457 10.0865L9 12.6923L9.79952 16.9231L12.1495 17.1885C12.4373 17.221 12.7023 17.3606 12.8919 17.5796C13.0816 17.7985 13.1819 18.0807 13.1731 18.3702L12.8462 30H26.6923L26.3654 18.3702C26.3565 18.0807 26.4569 17.7985 26.6465 17.5796C26.8361 17.3606 27.1012 17.221 27.3889 17.1885L29.7389 16.9231L30.5385 12.6923L23.0928 10.0865C22.9295 10.0293 22.7577 10.0001 22.5846 10Z"
                    stroke="black"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M23.4864 10.2236C23.2684 11.0429 22.7858 11.7673 22.1136 12.284C21.4414 12.8007 20.6174 13.0808 19.7696 13.0808C18.9217 13.0808 18.0977 12.8007 17.4255 12.284C16.7533 11.7673 16.2707 11.0429 16.0527 10.2236"
                    stroke="black"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <button className="text-sm text-gray-500 px-2 py-1 bg-gray-100 rounded-md">
                  This Week ▼
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-3 mt-4">
                    All Styles
                  </p>
                  <p className="text-lg font-semibold text-gray-800">15</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-3 mt-4">
                    Published
                  </p>
                  <p className="text-lg font-semibold text-gray-800">13</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-3 mt-4">
                    Unpublished
                  </p>
                  <p className="text-lg font-semibold text-gray-800">2</p>
                </div>
              </div>
            </div>

            {/* Wallet Card */}
            <div className="bg-white p-4 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="41"
                  height="41"
                  viewBox="0 0 41 41"
                  fill="none"
                >
                  <rect
                    x="0.46875"
                    y="0.308594"
                    width="40.2838"
                    height="40.2838"
                    rx="8.95195"
                    fill="#A5FF91"
                    fill-opacity="0.3"
                  />
                  <path
                    d="M30 17V14.4C30 13.075 29.12 12 28.036 12H11.964C10.879 12 10 13.075 10 14.4V25.6C10 26.925 10.88 28 11.964 28H28.036C29.121 28 30 26.925 30 25.6V23M29 20H29.01M25.6 17H30.4C30.8243 17 31.2313 17.1686 31.5314 17.4686C31.8314 17.7687 32 18.1757 32 18.6V21.4C32 21.8243 31.8314 22.2313 31.5314 22.5314C31.2313 22.8314 30.8243 23 30.4 23H25.6C25.1757 23 24.7687 22.8314 24.4686 22.5314C24.1686 22.2313 24 21.8243 24 21.4V18.6C24 18.1757 24.1686 17.7687 24.4686 17.4686C24.7687 17.1686 25.1757 17 25.6 17Z"
                    stroke="black"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <button className="text-sm text-gray-500 px-2 py-1 bg-gray-100 rounded-md">
                  This Week ▼
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-3 mt-4">
                    Total Earned
                  </p>
                  <p className="text-lg font-semibold text-gray-800">₦350K</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-3 mt-4">
                    Available Balance
                  </p>
                  <p className="text-lg font-semibold text-gray-800">₦42K</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg">
          <ReusableTable columns={customerColumns} data={customerData} />
        </div>

        {/* Tailor/Designer Catalog */}
        <div className="bg-white p-6 rounded-lg mb-6">
          <h2 className="font-medium text-gray-800 mb-4">
            Fabric Vendor Products
          </h2>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-3 mb-4 gap-4">
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-gray-600 text-sm font-medium">
              {["all", "published", "unpublished"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setCatalogFilter(tab);

                    if (tab === "all") {
                      setStatus(undefined);
                    }
                    if (tab === "published") {
                      setStatus("PUBLISHED");
                    }

                    if (tab === "unpublished") {
                      setStatus("DRAFT");
                    }
                  }}
                  className={`font-medium capitalize px-3 py-1 ${
                    catalogFilter === tab
                      ? "text-[#A14DF6] border-b-2 border-[#A14DF6]"
                      : "text-gray-500"
                  }`}
                >
                  {tab} Product
                </button>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <Search
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full sm:w-[200px] pl-10 pr-4 py-2 border border-gray-200 rounded-md outline-none text-sm"
                  value={queryString}
                  onChange={(evt) =>
                    setQueryString(
                      evt.target.value ? evt.target.value : undefined,
                    )
                  }
                />
              </div>
              <select
                onChange={handleExport}
                className="bg-gray-100 outline-none text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap"
              >
                <option value="" disabled selected>
                  Export As
                </option>
                <option value="csv">Export to CSV</option>{" "}
                <option value="excel">Export to Excel</option>{" "}
                <option value="pdf">Export to PDF</option>{" "}
              </select>
              <CSVLink
                id="csvDownload"
                data={FabricData?.map((row) => ({
                  SKU: row.sku,
                  "Product Name": row.name,
                  Category: row.category,
                  qty: row.location,
                  Status: row.status,
                }))}
                filename="MyProducts.csv"
                className="hidden"
              />{" "}
              {/* <button className="w-full sm:w-auto px-4 py-2 bg-gray-200 rounded-md text-sm">
              Sort: Newest First ▼
            </button> */}
            </div>
          </div>
          <ReusableTable
            loading={adminProductIsPending}
            columns={columns}
            data={FabricData}
          />
          {/* Pagination for Admin FAQs */}
          {getAllFabricFabricData?.count > pageSize && (
            <div className="mt-6 border-t border-gray-100 pt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                <div className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * pageSize + 1}-
                  {Math.min(
                    currentPage * pageSize,
                    getAllFabricFabricData?.count || 0,
                  )}{" "}
                  of {getAllFabricFabricData?.count || 0} Products
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1 || adminProductIsPending}
                    className={`px-3 py-1 rounded text-sm transition-all duration-200 ${
                      currentPage === 1 || adminProductIsPending
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-[#9847FE] hover:text-white hover:border-[#9847FE]"
                    }`}
                  >
                    Previous
                  </button>

                  {(() => {
                    const totalPages = Math.ceil(
                      (getAllFabricFabricData?.count || 0) / pageSize,
                    );
                    const maxVisiblePages = 5;
                    let startPage = Math.max(
                      1,
                      currentPage - Math.floor(maxVisiblePages / 2),
                    );
                    let endPage = Math.min(
                      totalPages,
                      startPage + maxVisiblePages - 1,
                    );

                    if (endPage - startPage + 1 < maxVisiblePages) {
                      startPage = Math.max(1, endPage - maxVisiblePages + 1);
                    }

                    const pages = [];
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(i);
                    }

                    return pages.map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        disabled={adminProductIsPending}
                        className={`px-3 py-1 rounded text-sm transition-all duration-200 ${
                          page === currentPage
                            ? "bg-[#9847FE] text-white border border-[#9847FE]"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-[#9847FE] hover:text-white hover:border-[#9847FE]"
                        }`}
                      >
                        {page}
                      </button>
                    ));
                  })()}

                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(
                          Math.ceil(
                            (getAllFabricFabricData?.count || 0) / pageSize,
                          ),
                          prev + 1,
                        ),
                      )
                    }
                    disabled={
                      currentPage ===
                        Math.ceil(
                          (getAllFabricFabricData?.count || 0) / pageSize,
                        ) || adminProductIsPending
                    }
                    className={`px-3 py-1 rounded text-sm transition-all duration-200 ${
                      currentPage ===
                        Math.ceil(
                          (getAllFabricFabricData?.count || 0) / pageSize,
                        ) || adminProductIsPending
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-[#9847FE] hover:text-white hover:border-[#9847FE]"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Orders Handled */}
        <div className="bg-white p-6 rounded-lg">
          <h2 className="font-medium text-gray-800 mb-4">Orders Handled</h2>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-3 mb-4 gap-4">
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-gray-600 text-sm font-medium">
              {["all", "ongoing", "completed", "cancelled"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setOrdersFilter(tab);

                    if (tab === "all") {
                      setOrderStatus(undefined);
                    }
                    if (tab === "ongoing") {
                      setOrderStatus("PROCESSING");
                    }

                    if (tab === "completed") {
                      setOrderStatus("DELIVERED");
                    }

                    if (tab === "cancelled") {
                      setOrderStatus("CANCELLED");
                    }
                  }}
                  className={`font-medium capitalize px-3 py-1 ${
                    ordersFilter === tab
                      ? "text-[#A14DF6] border-b-2 border-[#A14DF6]"
                      : "text-gray-500"
                  }`}
                >
                  {tab} Orders
                </button>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <Search
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full sm:w-[200px] pl-10 pr-4 py-2 border border-gray-200 rounded-md outline-none text-sm"
                  value={queryOrderString}
                  onChange={(evt) =>
                    setQueryOrderString(
                      evt.target.value ? evt.target.value : undefined,
                    )
                  }
                />
              </div>
              {/* <button className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-md text-sm">
                Export As ▼
              </button>
              <button className="w-full sm:w-auto px-4 py-2 bg-gray-200 rounded-md text-sm">
                Sort: Newest First ▼
              </button> */}
            </div>
          </div>
          <ReusableTable
            loading={fetchIsPending}
            columns={updatedColumn}
            data={fabricOrderData}
          />
          {fetchVendorOrders?.count > orderPageSize && (
            <div className="mt-6 border-t border-gray-100 pt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                <div className="text-sm text-gray-500">
                  Showing {(orderCurrentPage - 1) * orderPageSize + 1}-
                  {Math.min(
                    orderCurrentPage * orderPageSize,
                    fetchVendorOrders?.count || 0,
                  )}{" "}
                  of {fetchVendorOrders?.count || 0} Orders
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={orderCurrentPage === 1 || fetchIsPending}
                    className={`px-3 py-1 rounded text-sm transition-all duration-200 ${
                      orderCurrentPage === 1 || fetchIsPending
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-[#9847FE] hover:text-white hover:border-[#9847FE]"
                    }`}
                  >
                    Previous
                  </button>

                  {(() => {
                    const totalPages = Math.ceil(
                      (fetchVendorOrders?.count || 0) / orderPageSize,
                    );
                    const maxVisiblePages = 5;
                    let startPage = Math.max(
                      1,
                      orderCurrentPage - Math.floor(maxVisiblePages / 2),
                    );
                    let endPage = Math.min(
                      totalPages,
                      startPage + maxVisiblePages - 1,
                    );

                    if (endPage - startPage + 1 < maxVisiblePages) {
                      startPage = Math.max(1, endPage - maxVisiblePages + 1);
                    }

                    const pages = [];
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(i);
                    }

                    return pages.map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        disabled={fetchIsPending}
                        className={`px-3 py-1 rounded text-sm transition-all duration-200 ${
                          page === currentPage
                            ? "bg-[#9847FE] text-white border border-[#9847FE]"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-[#9847FE] hover:text-white hover:border-[#9847FE]"
                        }`}
                      >
                        {page}
                      </button>
                    ));
                  })()}

                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(
                          Math.ceil(
                            (fetchVendorOrders?.count || 0) / orderPageSize,
                          ),
                          prev + 1,
                        ),
                      )
                    }
                    disabled={
                      orderCurrentPage ===
                        Math.ceil(
                          (fetchVendorOrders?.count || 0) / orderPageSize,
                        ) || fetchIsPending
                    }
                    className={`px-3 py-1 rounded text-sm transition-all duration-200 ${
                      orderCurrentPage ===
                        Math.ceil(
                          (fetchVendorOrders?.count || 0) / orderPageSize,
                        ) || fetchIsPending
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-[#9847FE] hover:text-white hover:border-[#9847FE]"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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
                if (!navigator.onLine) {
                  toastError(
                    "No internet connection. Please check your network.",
                  );
                  return;
                }
                e.preventDefault();
                deleteAdminFabricMutate(
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
                  disabled={deleteAdminIsPending}
                  className="mt-6 cursor-pointer w-full bg-gradient text-white px-4 py-3 text-sm rounded-md"
                >
                  {deleteAdminIsPending ? "Please wait..." : "Delete Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewFabric;
