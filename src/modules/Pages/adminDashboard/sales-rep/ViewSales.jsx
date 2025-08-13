import React, { useState, useEffect } from "react";
import ReusableTable from "../components/ReusableTable";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Shirt,
  Wallet,
} from "lucide-react";
import useApproveMarketRep from "../../../../hooks/marketRep/useApproveMarketRep";
import { useModalState } from "../../../../hooks/useModalState";
import RejectModal from "./RejectModal";
import Loader from "../../../../components/ui/Loader";
import useGetUser from "../../../../hooks/user/useGetSingleUser";
import { formatDateStr } from "../../../../lib/helper";
import CustomTable from "../../../../components/CustomTable";
import SalesCards from "../components/SalesCards";
import SalesRepUsers from "./SalesRepUsers";

const ViewCustomer = () => {
  const { salesId } = useParams();

  const { isPending, approveMarketRepMutate } = useApproveMarketRep();

  const { isPending: userIsPending, data } = useGetUser(salesId);

  const userData = data?.data?.user;
  const kycData = data?.data?.kyc;

  const businessData = data?.data?.business;

  const navigate = useNavigate();

  const [id, setId] = useState(null);

  const { isOpen, closeModal, openModal } = useModalState();

  const [catalogFilter, setCatalogFilter] = useState("all");
  const [ordersFilter, setOrdersFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [catalogPage, setCatalogPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const itemsPerPage = 4;

  // Filter Catalog Data

  // Filter Orders Data

  const catalog_action = [
    {
      key: "view_details",
      label: "view detail",
      action: (item) => navigate("/admin/sales-rep/product/" + item.id),
    },
  ];
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
        render: (kyc) => (
          <Link
            state={{
              info: {
                ...businessData,
                ...userData,
                ...kycData,
                kyc: kycData ?? null,
              },
            }}
            to={`/admin/sales-rep/view?tab=kyc`}
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
                  state={{
                    info: {
                      ...businessData,
                      ...userData,
                      kyc: kycData ?? null,
                    },
                  }}
                  // to={`/admin/tailors/view?tab=personal`}
                  to={`/admin/sales-rep/view?tab=personal`}
                >
                  <button className="block cursor-pointer w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                    View Details
                  </button>
                </Link>
                {userData?.profile?.approved_by_admin == null ? (
                  <>
                    {" "}
                    <button
                      onClick={() => {
                        approveMarketRepMutate(
                          {
                            user_id: userData?.id,
                            approved: true,
                          },
                          {
                            onSuccess: () => {
                              navigate("/admin/sales-rep");
                            },
                          },
                        );
                      }}
                      className="block cursor-pointer w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      {isPending ? "Please wait..." : "Approve"}
                    </button>
                    <button
                      onClick={() => {
                        openModal();
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <></>
                )}

                <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                  Edit User
                </button>
              </div>
            )}
          </div>
        ),
      },
    ],
    [openDropdown, businessData, isPending],
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

  // Reset page when filter changes
  useEffect(() => {
    setCatalogPage(1);
  }, [catalogFilter]);

  if (userIsPending) {
    return (
      <div className="m-auto flex h-[80vh] items-center justify-center">
        <Loader />
      </div>
    );
  }
  const tableHead = [
    { key: "id", label: "S/N" },
    { key: "thumbnail", label: "Thumbnail Image" },
    { key: "styleName", label: "Style Name" },
    { key: "category", label: "Categories" },
    { key: "sewingTime", label: "Sewing Time" },
    { key: "price", label: "Price" },
    { key: "status", label: "Status" },
  ];

  return (
    <React.Fragment>
      <div className="">
        <button
          onClick={() => {
            navigate("/admin/sales-rep");
          }}
          className="bg-gray-100 cursor-pointer text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap"
        >
          ◀ Back
        </button>
        {/* Customer Info Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">
              View Market Rep :{" "}
              <span className="text-purple-600 font-medium">
                {userData?.name}
              </span>
            </h2>
            {data?.data?.kyc?.is_approved ? (
              <p className="text-sm font-medium text-gray-600">
                KYC:{" "}
                <span className="text-green-600 font-medium">Approved</span>
              </p>
            ) : (
              <></>
            )}
          </div>
          <SalesCards />
          <div className="bg-white rounded-lg">
            <CustomTable columns={customerColumns} data={customerData} />
            {/* <ReusableTable columns={customerColumns} data={customerData} />*/}
          </div>
          <div className=" mt-12   rounded-md ">
            <div className="flex items-center justify-between mb-4   rounded-md  py-0">
              <h2 className="text-xl font-semibold text-gray-800">
                Users Added By {userData.name}
              </h2>
            </div>
            <div data-theme="nord" id="cus-app" className="">
              <SalesRepUsers />
            </div>
          </div>
        </div>
      </div>
      <RejectModal id={userData?.id} isOpen={isOpen} onClose={closeModal} />
    </React.Fragment>
  );
};

export default ViewCustomer;
