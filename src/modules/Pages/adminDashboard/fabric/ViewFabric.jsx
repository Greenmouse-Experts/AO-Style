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
import CustomTable from "../../../../components/CustomTable";

// Removed static catalogData to prevent duplication with dynamic data

// Removed static ordersData to prevent duplication with dynamic data

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

  // Filter logic moved to after FabricData definition

  const columns = useMemo(
    () => [
      { label: "SKU", key: "sku" },
      { label: "Product Name", key: "name" },
      {
        label: "Image",
        key: "image",
        render: (image, row) => (
          <div className="flex items-center">
            {row?.fabric?.photos && row?.fabric?.photos.length > 0 ? (
              <img
                src={row.fabric.photos[0]}
                alt={row?.name || "Product"}
                className="w-12 h-12 rounded object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className="w-12 h-12 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-medium text-white text-sm"
              style={{
                display:
                  row?.fabric?.photos && row?.fabric?.photos.length > 0
                    ? "none"
                    : "flex",
              }}
            >
              {row?.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
          </div>
        ),
      },
      { label: "Category", key: "category" },
      {
        label: "Fabric Type",
        key: "fabric_type",
        render: (fabric_type, row) => (
          <div className="text-sm">
            <div className="font-medium">{fabric_type || "N/A"}</div>
            {row.fabric_gender && (
              <div className="text-xs text-gray-500">{row.fabric_gender}</div>
            )}
          </div>
        ),
      },
      {
        label: "Price",
        key: "price",
        render: (price, row) => (
          <div className="text-sm font-semibold text-green-600">{price}</div>
        ),
      },
      { label: "Quantity", key: "qty" },
      {
        label: "Business",
        key: "business_name",
        render: (business_name, row) => (
          <div className="text-sm">
            <div className="font-medium">{business_name || "N/A"}</div>
            <div className="text-xs text-gray-500">by {row.creator_name}</div>
          </div>
        ),
      },
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
                      console.log("🚀 Publishing fabric product:", row);
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
                      console.log("📝 Drafting fabric product:", row);
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
                  state={{ info: row?.original || row }}
                  to={"/admin/fabric/edit-product"}
                  className="block cursor-pointer text-center px-4 py-2 text-gray-700 hover:bg-gray-100 w-full"
                  onClick={() => console.log("👁️ Viewing fabric product:", row)}
                >
                  {"View Product"}
                </Link>
                <button
                  onClick={() => {
                    console.log("🗑️ Removing fabric product:", row);
                    setNewCategory(row?.original || row);
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
                  to={`/admin/fabric/orders/orders-details/${row.order_id}`}
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
                {/* <Link
                  state={{ info: row.id }}
                  to={`/admin/orders/vendor/` + row.id}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Edit User
                </Link>*/}
              </div>
            )}
          </div>
        ),
      },
    ],
    [openDropdown, businessData],
  );

  const FabricData = useMemo(() => {
    if (!getAllFabricFabricData?.data) return [];

    // Remove duplicates based on unique product ID
    const uniqueProducts = getAllFabricFabricData.data.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id),
    );

    return uniqueProducts.map((details) => {
      console.log("🔍 Processing fabric item:", details);

      return {
        ...details,
        id: details?.id ?? "",
        category_id: `${details?.category?.id ?? ""}`,
        name: `${details?.name ?? ""}`,
        sku: `${details?.sku ?? ""}`,
        category: `${details?.category?.name ?? ""}`,
        qty: `${details?.fabric?.quantity ?? details?.fabric?.weight_per_unit ?? "0"} ${details?.fabric?.weight_per_unit ? "units" : ""}`.trim(),
        price: `₦${formatNumberWithCommas(details?.price ?? details?.original_price ?? 0)}`,
        status: details?.status ?? details?.approval_status ?? "DRAFT",
        fabric_type: `${details?.fabric?.type ?? "Cotton"}`,
        fabric_gender: `${details?.fabric?.gender ?? "Unisex"}`,
        fabric_id: `${details?.fabric?.id ?? ""}`,
        market_id: `${details?.fabric?.market_id ?? ""}`,
        business_name: `${details?.business_info?.Object?.business_name ?? ""}`,
        creator_name: `${details?.creator?.Object?.name ?? "Admin"}`,
        description: `${details?.description ?? ""}`,
        created_at: `${
          details?.created_at
            ? formatDateStr(details?.created_at.split(".").shift())
            : ""
        }`,
        // Store the full fabric object for image access
        fabric: details?.fabric,
        // Store original details for actions
        original: details,
      };
    });
  }, [getAllFabricFabricData]);

  // Debug logging for final fabric data
  console.log("🎯 FINAL FABRIC DATA FOR TABLE:", FabricData);
  console.log("📊 FABRIC DATA COUNT:", FabricData.length);
  console.log("🔍 RAW API DATA:", getAllFabricFabricData);

  // Filter Catalog Data
  const filteredCatalog = useMemo(() => {
    return (FabricData || []).filter((item) => {
      if (catalogFilter === "all") return true;
      if (catalogFilter === "published") return item.status === "PUBLISHED";
      if (catalogFilter === "unpublished") return item.status === "UNPUBLISHED";
      return true;
    });
  }, [FabricData, catalogFilter]);

  // Filter Orders Data
  const filteredOrders = useMemo(() => {
    return (fetchVendorOrders?.data || []).filter(
      (order) =>
        (ordersFilter === "all" ||
          order.status.toLowerCase() === ordersFilter) &&
        (order.orderId || "").toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [fetchVendorOrders?.data, ordersFilter, searchTerm]);

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

  const navigate = useNavigate();

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
                view fabric vendor {userData?.name}
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
          {/* <CustomTable columns={columns} />*/}
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
                  "Fabric Type": row.fabric_type,
                  Quantity: row.qty,
                  Price: row.price,
                  Status: row.status,
                  Business: row.business_name,
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
            emptyStateMessage={
              !adminProductIsPending && FabricData.length === 0
                ? "No fabric products found. Create your first product to get started!"
                : undefined
            }
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
