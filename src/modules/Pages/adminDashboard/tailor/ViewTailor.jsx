import React, { useState, useEffect, useMemo } from "react";
import ReusableTable from "../components/ReusableTable";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Shirt,
  Wallet,
  MoreVertical,
} from "lucide-react";
import useGetUser from "../../../../hooks/user/useGetSingleUser";
import Loader from "../../../../components/ui/Loader";
import { formatDateStr, formatNumberWithCommas } from "../../../../lib/helper";
import useGetAdminFabricProduct from "../../../../hooks/fabric/useGetAdminFabricProduct";
import useDebounce from "../../../../hooks/useDebounce";
import useUpdateAdminStyle from "../../../../hooks/style/useUpdateAdminStyle";
import useDeleteAdminStyle from "../../../../hooks/style/useDeleteAdminStyle";
import useToast from "../../../../hooks/useToast";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { CSVLink } from "react-csv";
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

const ViewCustomer = () => {
  const { tailorId } = useParams();

  console.log(tailorId, "id");

  const { toastError } = useToast();

  const { isPending: deleteAdminIsPending, deleteAdminStyleMutate } =
    useDeleteAdminStyle();

  const [newCategory, setNewCategory] = useState();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { isPending, data } = useGetUser(tailorId);

  const userData = data?.data?.user;

  const businessData = data?.data?.business;

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const navigate = useNavigate();

  const [status, setStatus] = useState(undefined);

  const [queryString, setQueryString] = useState("");

  const [queryOrderString, setQueryOrderString] = useState("");

  const { isPending: updateAdminIsPending, updateAdminStyleMutate } =
    useUpdateAdminStyle(businessData?.id);

  const debouncedSearchTerm = useDebounce(queryString ?? "", 1000);

  const debouncedOrderSearchTerm = useDebounce(queryOrderString ?? "", 1000);

  const { data: getAllFabricFabricData, isPending: adminProductIsPending } =
    useGetAdminFabricProduct({
      business_id: businessData?.id,
      "pagination[page]": currentPage,
      "pagination[limit]": pageSize,
      status,
      q: debouncedSearchTerm.trim() || undefined,
    });

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

  console.log(fetchVendorOrders, "vendor orders");

  const handleExport = (e) => {
    const value = e.target.value;
    if (value === "excel") exportToExcel();
    if (value === "pdf") exportToPDF();
    if (value === "csv") document.getElementById("csvDownload").click();
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(getAllFabricFabricData?.data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "StylesCatalog.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Style Name", "Price", "Status"]],
      body: getAllFabricFabricData?.data?.map((row) => [
        row.name,
        row.phone,
        row.email,
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
    doc.save("StylesCatalog.pdf");
  };

  const [catalogFilter, setCatalogFilter] = useState("all");
  const [ordersFilter, setOrdersFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
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
      // { label: "Transaction ID", key: "transactionId" },
      // { label: "Customer", key: "customer" },
      { label: "Product", key: "product" },
      // {
      //   label: "Body Measurement",
      //   key: "measurement",
      //   render: (text) => (
      //     <Link to="#" className="text-blue-500 hover:underline">
      //       {text}
      //     </Link>
      //   ),
      // },
      { label: "Amount", key: "amount" },
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
                <Link to={`/admin/tailors/orders-details/${row.order_id}`}>
                  <button className="block cursor-pointer w-full text-left px-4 py-2 hover:bg-gray-100">
                    View Details
                  </button>
                </Link>
                {/* <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                  Cancel Order
                </button>
                <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                  Track Order
                </button> */}
              </div>
            )}
          </div>
        ),
      },
    ],
    [openDropdown],
  );

  const fabricOrderData = useMemo(() => {
    if (!fetchVendorOrders?.data) return [];

    // Remove duplicates based on unique order ID
    const uniqueOrders = fetchVendorOrders.data.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id),
    );

    return uniqueOrders.map((details) => {
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
        amount: `${formatNumberWithCommas(details?.order?.total_amount ?? 0)}`,
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
    });
  }, [fetchVendorOrders?.data]);

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
        render: (kyc) => (
          <Link
            state={{ info: { ...businessData, ...userData } }}
            to={`/admin/tailors/view?tab=kyc`}
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
                  state={{ info: { ...businessData, ...userData } }}
                  to={`/admin/tailors/view?tab=personal`}
                >
                  <button className="block cursor-pointer w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                    View Details
                  </button>
                </Link>
                <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                  Edit User
                </button>
              </div>
            )}
          </div>
        ),
      },
    ],
    [openDropdown, businessData, userData], // Fixed dependency
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
  const ordersStartIndex = (ordersPage - 1) * itemsPerPage;
  const ordersCurrentItems = filteredOrders.slice(
    ordersStartIndex,
    ordersStartIndex + itemsPerPage,
  );

  // Reset page when filter changes
  useEffect(() => {
    setCatalogPage(1);
  }, [catalogFilter]);

  useEffect(() => {
    setOrdersPage(1);
  }, [ordersFilter]);

  // useEffect(() => {
  //   const handleClickOutside = (event) => {
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
            navigate("/admin/tailors");
          }}
          className="bg-gray-100 cursor-pointer text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap"
        >
          ◀ Back
        </button>

        {/* Customer Info Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">
              View Tailor/Designer:{" "}
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
        </div>
        <div className="bg-white rounded-lg">
          <ReusableTable columns={customerColumns} data={customerData} />
        </div>

        {/* Tailor/Designer Catalog */}
        <div className="bg-white p-6 rounded-lg mb-6">
          <h2 className="font-medium text-gray-800 mb-4">
            Tailor/Designer Catalog
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
                  {tab} Styles
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
                data={
                  getAllFabricFabricData?.data
                    ? getAllFabricFabricData?.data?.map((row) => ({
                        Style: row.name,
                        Price: row.phone,
                        Status: row.status,
                      }))
                    : []
                }
                filename="StylesCatalog.csv"
                className="hidden"
              />{" "}
              <button className="w-full sm:w-auto px-4 py-2 bg-gray-200 rounded-md text-sm">
                Sort: Newest First ▼
              </button>
            </div>
          </div>
          {adminProductIsPending ? (
            <>
              <div className=" flex !w-full items-center justify-center">
                <Loader />
              </div>
            </>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 text-sm">
                      <th className="py-3">Style</th>
                      <th className="hidden md:table-cell">Price</th>
                      {/* <th className="hidden md:table-cell">Sold</th> */}
                      <th>Status</th>
                      {/* <th className="hidden md:table-cell">Rating</th>
                      <th className="hidden md:table-cell">Income</th>*/}
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {getAllFabricFabricData?.data?.map((style) => (
                      <tr
                        key={style.id}
                        className="border-b border-gray-200 text-sm"
                      >
                        <td className="flex items-center space-x-3 py-4">
                          {style?.style?.photos[0] ? (
                            <img
                              src={style?.style?.photos[0]}
                              alt={style.name}
                              className="w-12 h-12 md:w-16 md:h-16 rounded-md"
                            />
                          ) : (
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-md">
                              {style.name}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm md:text-base">
                              {style.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {style?.category?.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              Uploaded on{" "}
                              {style?.created_at
                                ? formatDateStr(
                                    style?.created_at?.split(".").shift(),
                                    "DD-MM-YY",
                                  )
                                : ""}
                            </p>
                          </div>
                        </td>
                        <td className="hidden md:table-cell">
                          {formatNumberWithCommas(style.price ?? 0)}
                        </td>
                        {/* <td className="hidden md:table-cell">{style.sold}</td> */}
                        <td>
                          <span
                            className={`px-3 py-1 text-xs md:text-sm rounded-md ${
                              style.status === "PUBLISHED"
                                ? "bg-green-100 text-green-600"
                                : style.status === "DRAFT"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-600"
                            }`}
                          >
                            {style.status}
                          </span>
                        </td>
                        {/* <td className="hidden md:table-cell">{style.rating}</td>
                        <td className="hidden md:table-cell">{style.income}</td>*/}
                        <td className="relative">
                          <button
                            className="cursor-pointer"
                            onClick={() =>
                              setOpenDropdown(
                                openDropdown === style.id ? null : style.id,
                              )
                            }
                          >
                            <MoreVertical className="text-gray-500" />
                          </button>
                          {openDropdown === style.id && (
                            <div className="absolute cursor-pointer right-0 mt-2 bg-white shadow-md rounded-md py-2 w-32 z-50">
                              <Link
                                to={"/admin/style/edit-product"}
                                state={{ info: style }}
                                className="block  cursor-pointer w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                              >
                                {"View"}
                              </Link>
                              {style?.status === "DRAFT" ? (
                                <button
                                  onClick={() => {
                                    updateAdminStyleMutate(
                                      {
                                        id: style?.id,
                                        product: {
                                          name: style?.name,
                                          sku: style?.sku,
                                          category_id: style?.category_id,
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
                                  className="block w-full cursor-pointer text-left px-4 py-2 text-sm hover:bg-gray-100"
                                >
                                  {updateAdminIsPending
                                    ? "Please wait..."
                                    : "Publish Style"}
                                </button>
                              ) : null}

                              {style?.status === "PUBLISHED" ? (
                                <button
                                  onClick={() => {
                                    updateAdminStyleMutate(
                                      {
                                        id: style?.id,
                                        product: {
                                          name: style?.name,
                                          sku: style?.sku,
                                          category_id: style?.category_id,
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
                                  className="block w-full cursor-pointer text-left px-4 py-2 text-sm hover:bg-gray-100"
                                >
                                  {updateAdminIsPending
                                    ? "Please wait..."
                                    : "Draft Style"}
                                </button>
                              ) : null}

                              <button
                                onClick={() => {
                                  setNewCategory(style);
                                  setIsAddModalOpen(true);
                                  setOpenDropdown(null);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm cursor-pointer text-red-500 hover:bg-red-100"
                              >
                                Delete
                              </button>
                              {/* <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                        View Details
                      </button> */}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

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
                          startPage = Math.max(
                            1,
                            endPage - maxVisiblePages + 1,
                          );
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
            </>
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
            columns={columns}
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
                      setOrderCurrentPage((prev) => Math.max(1, prev - 1))
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
                        onClick={() => setOrderCurrentPage(page)}
                        disabled={fetchIsPending}
                        className={`px-3 py-1 rounded text-sm transition-all duration-200 ${
                          page === orderCurrentPage
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
                      setOrderCurrentPage((prev) =>
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
                className="text-gray-500 cursor-pointer hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <h3 className="text-lg font-semibold mb-4 -mt-7">
              {"Delete Style"}
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
                deleteAdminStyleMutate(
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
                  type="button"
                  className="mt-6 cursor-pointer w-full bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-3 text-sm rounded-md"
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
                  {deleteAdminIsPending ? "Please wait..." : "Delete Style"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewCustomer;
