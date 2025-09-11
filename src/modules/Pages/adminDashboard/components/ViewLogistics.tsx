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
  Package,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  Star,
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
import CustomBackbtn from "../../../../components/CustomBackBtn";
import LogisticsOrdersHandled from "../logistics/components/logistic-orders-handled";

// Stat Card Component
const StatCard = ({ title, value, change, icon: Icon, color, trend }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change && (
          <div
            className={`flex items-center mt-2 text-sm ${
              trend === "up"
                ? "text-green-600"
                : trend === "down"
                  ? "text-red-600"
                  : "text-gray-600"
            }`}
          >
            {trend === "up" && <TrendingUp className="w-4 h-4 mr-1" />}
            {trend === "down" && (
              <TrendingUp className="w-4 h-4 mr-1 rotate-180" />
            )}
            <span>{change}</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const ViewLogistics = () => {
  const { id: tailorId } = useParams();

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

  const { data: getAllFabricData } = useGetFabricProduct({
    type: "FABRIC",
    id: businessData?.id,
  });
  console.log(businessData, "sall fabric");
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
              </div>
            )}
          </div>
        ),
      },
    ],
    [openDropdown, businessData],
  );

  // Calculate statistics based on fetched data
  const statsData = useMemo(() => {
    const orders = fabricOrderData || [];
    const totalOrders = orders.length;
    const completedOrders = orders.filter(
      (order) => order.status === "Completed" || order.status === "COMPLETED",
    ).length;
    const ongoingOrders = orders.filter(
      (order) => order.status === "Ongoing" || order.status === "PENDING",
    ).length;

    const totalRevenue = orders.reduce((sum, order) => {
      const amount = parseFloat(order.amount?.replace(/,/g, "") || 0);
      return sum + amount;
    }, 0);

    // Calculate completion rate
    const completionRate =
      totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

    return {
      totalOrders,
      completedOrders,
      ongoingOrders,
      totalRevenue,
      completionRate,
    };
  }, [fabricOrderData]);

  // Filter Catalog Data

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
        <div className="mb-3">
          <CustomBackbtn />
        </div>

        {/* Customer Info Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">
              View Logistics:{" "}
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Orders"
            value={statsData.totalOrders.toLocaleString()}
            icon={Package}
            color="bg-blue-500"
            change="All time"
          />

          <StatCard
            title="Completed Orders"
            value={statsData.completedOrders.toLocaleString()}
            icon={CheckCircle}
            color="bg-green-500"
            change={`${statsData.completionRate}% completion rate`}
            trend="up"
          />

          <StatCard
            title="Ongoing Orders"
            value={statsData.ongoingOrders.toLocaleString()}
            icon={Clock}
            color="bg-orange-500"
            change="Currently processing"
          />

          <StatCard
            title="Total Revenue"
            value={`₦${formatNumberWithCommas(statsData.totalRevenue)}`}
            icon={Wallet}
            color="bg-purple-500"
            change="Gross earnings"
            trend="up"
          />
        </div>

        <div className="bg-white rounded-lg">
          <ReusableTable
            columns={customerColumns}
            data={customerData}
            loading={isPending}
          />
        </div>

        {/* Orders Handled */}
        <div
          className="mt-12 bg-base-100 p-3 shadow rounded-md"
          data-theme="nord"
        >
          <LogisticsOrdersHandled id={tailorId} />
        </div>
      </div>
    </>
  );
};

export default ViewLogistics;
