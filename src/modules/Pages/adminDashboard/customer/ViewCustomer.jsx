import React, { useState } from "react";
import ReusableTable from "../components/ReusableTable";
import { Link, useParams } from "react-router-dom";
import { Search } from "lucide-react";
import useGetUser from "../../../../hooks/user/useGetSingleUser";
import Loader from "../../../../components/ui/Loader";
import { formatDateStr } from "../../../../lib/helper";

const orders = [
  {
    id: "01",
    orderId: "QWER123DFDG324R",
    date: "15-02-25",
    vendor: "Sandra Fabrics",
    designer: "Jude Stitches",
    delivery: "21-05-25",
    status: "Ongoing",
  },
  {
    id: "02",
    orderId: "QWER123DFDG324R",
    date: "15-02-25",
    vendor: "Sandra Fabrics",
    designer: "Hamzat Stitches",
    delivery: "21-05-25",
    status: "Ongoing",
  },
  {
    id: "03",
    orderId: "QWER123DFDG324R",
    date: "15-02-25",
    vendor: "Sandra Fabrics",
    designer: "Jude Stitches",
    delivery: "21-05-25",
    status: "Ongoing",
  },
  {
    id: "04",
    orderId: "QWER123DFDG324R",
    date: "15-02-25",
    vendor: "Sandra Fabrics",
    designer: "Jude Stitches",
    delivery: "21-05-25",
    status: "Cancelled",
  },
  {
    id: "05",
    orderId: "QWER123DFDG324R",
    date: "15-02-25",
    vendor: "Sandra Fabrics",
    designer: "Jude Stitches",
    delivery: "21-05-25",
    status: "Ongoing",
  },
  {
    id: "06",
    orderId: "QWER123DFDG324R",
    date: "15-02-25",
    vendor: "Sandra Fabrics",
    designer: "Jude Stitches",
    delivery: "21-05-25",
    status: "Completed",
  },
];

const ViewCustomer = () => {
  const { id } = useParams();

  const { isPending: getUserIsPending, data } = useGetUser(id);

  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const filteredOrders = orders.filter(
    (order) =>
      (filter === "all" || order.status.toLowerCase() === filter) &&
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

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

  const columns = [
    { label: "#", key: "id" },
    { label: "Order ID", key: "orderId" },
    { label: "Order Date", key: "date" },
    { label: "Fabric Vendor", key: "vendor" },
    { label: "Tailor/Fashion Designer", key: "designer" },
    { label: "Delivery Date", key: "delivery" },
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
              <Link to="/customer/orders/orders-details">
                <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                  View Details
                </button>
              </Link>
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                Cancel Order
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  if (getUserIsPending) {
    return (
      <div className="m-auto flex h-[80vh] items-center justify-center">
        <Loader />
      </div>
    );
  }


  const customer = data?.data?.user;


  return (
    <div>
      {/* Customer Info Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg text-gray-800">
            View Customer:{" "}
            <span className="text-purple-600">{data?.data?.user?.name}</span>
          </h2>
          {/* <p className="text-sm text-gray-600">
            KYC: <span className="text-green-600">Approved</span>
          </p> */}
        </div>
        <div className="bg-white rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-700 border-b border-gray-200">
                <th className="text-left p-4 font-medium text-gray-600">
                  Full Name{" "}
                </th>
                {/* <th className="text-left p-4 font-medium text-gray-600">KYC</th> */}
                <th className="text-left p-4 font-medium text-gray-600">
                  Email Address
                </th>
                <th className="text-left p-4 font-medium text-gray-600">
                  Phone Number
                </th>
                <th className="text-left p-4 font-medium text-gray-600">
                  Address
                </th>
                {/* <th className="text-left p-4 font-medium text-gray-600">
                  Total Orders
                </th> */}
                <th className="text-left p-4 font-medium text-gray-600">
                  Date Joined
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-gray-600">
                <td className="p-4 flex items-center gap-3">
                  <img
                    src="https://randomuser.me/api/portraits/thumb/men/1.jpg"
                    alt="profile"
                    className="w-10 h-10 rounded-full"
                  />
                  <span>{data?.data?.user?.name}</span>
                </td>
                {/* <td className="p-4">
                  <span className="text-purple-600 cursor-pointer hover:underline">
                    See KYC
                  </span>
                </td> */}
                <td className="p-4">{data?.data?.user?.email}</td>
                <td className="p-4">{data?.data?.user?.phone}</td>
                <td className="p-4">{data?.data?.user?.profile?.address}</td>
                {/* <td className="p-4">72</td> */}
                <td className="p-4">
                  {data?.data?.user?.created_at
                    ? formatDateStr(
                        data?.data?.user?.created_at.split(".").shift()
                      )
                    : ""}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg">
        {/* Filters & Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-3 mb-4 gap-4">
          <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-gray-600 text-sm font-medium">
            {["all", "ongoing", "completed", "cancelled"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`font-medium capitalize px-3 py-1 ${
                  filter === tab
                    ? "text-[#A14DF6] border-b-2 border-[#A14DF6]"
                    : "text-gray-500"
                }`}
              >
                {tab} Orders
              </button>
            ))}
          </div>

          {/* Search & Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search"
                className="w-full sm:w-[200px] pl-10 pr-4 py-2 border border-gray-200 rounded-md outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="w-full sm:w-auto px-4 py-2 bg-gray-200 rounded-md text-sm">
              Export As ▼
            </button>
            <button className="w-full sm:w-auto px-4 py-2 bg-gray-200 rounded-md text-sm">
              Sort: Newest First ▼
            </button>
          </div>
        </div>

        {/* Table Section */}
        <ReusableTable columns={columns} data={currentItems} />

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex">
            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </p>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="py-2 px-3 border border-gray-200 ml-4 rounded-md outline-none text-sm w-auto"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
          </div>
          <div className="flex gap-1">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md bg-gray-200"
            >
              ◀
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md bg-gray-200"
            >
              ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCustomer;
