import { useState, useRef, useEffect } from "react";
import ReusableTable from "../components/ReusableTable";
import { FaEllipsisH } from "react-icons/fa";
import AddMarketModal from "./AddMarketModal";
import { Link } from "react-router-dom";
import useGetAllMarketRep from "../../../../hooks/marketRep/useGetMarketRep";
import useQueryParams from "../../../../hooks/useQueryParams";
import useGetBusinessDetails from "../../../../hooks/settings/useGetBusinessDetails";
import { useMemo } from "react";
import { formatDateStr } from "../../../../lib/helper";

const NewlyAddedUsers = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: businessData } = useGetBusinessDetails();

  const { queryParams, updateQueryParams } = useQueryParams({
    per_page: 10,
    status: "",
    "pagination[limit]": 10,
    "pagination[page]": 1,
  });

  const { data: getAllMarketRepData, isPending } = useGetAllMarketRep({
    ...queryParams,
    id: businessData?.data?.id,
  });

  const MarketRepData = useMemo(
    () =>
      getAllMarketRepData?.data
        ? getAllMarketRepData?.data.map((details) => {
            return {
              ...details,
              name: `${details?.name}`,
              userType: `${details?.user?.role?.name ?? ""}`,
              created_at: `${
                details?.created_at
                  ? formatDateStr(details?.created_at.split(".").shift())
                  : ""
              }`,
            };
          })
        : [],
    [getAllMarketRepData?.data]
  );

  // Toggle dropdown function
  const toggleDropdown = (rowId) => {
    setOpenDropdown(openDropdown === rowId ? null : rowId);
  };

  // Table Columns
  const columns = useMemo(
    () => [
      { label: "Name", key: "name" },
      { label: "User Type", key: "userType" },
      { label: "Date Added", key: "created_at" },
      {
        label: "Status",
        key: "status",
        render: (_, row) => (
          <span
            className={`px-3 py-1 text-sm rounded-md ${
              row.status === "Approved" || row.status === "active"
                ? "bg-green-100 text-green-600"
                : row.status === "Pending"
                ? "bg-yellow-100 text-yellow-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {row.status}
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
              onClick={() => {
                toggleDropdown(row.id);
                console.log("row", row);
              }}
            >
              <FaEllipsisH />
            </button>
            {openDropdown === row.id && (
              <div className="dropdown-menu absolute right-0 mt-2 w-50 bg-white rounded-md z-10 border-gray-200">
                <Link
                  to={`/admin/sales-rep/view-sales`}
                  state={{ info: row }}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-center"
                >
                  View Market Rep
                </Link>
                <button className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-center">
                  Edit User
                </button>
                <button className="block px-4 py-2 text-red-500 hover:bg-red-100 w-full text-center">
                  Remove User
                </button>
              </div>
            )}
          </div>
        ),
      },
    ],
    [toggleDropdown, openDropdown]
  );
  const filteredData = MarketRepData?.filter((order) =>
    Object.values(order).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Close dropdown when clicking outside
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
    <div className="bg-white p-6 rounded-xl overflow-x-auto">
      <div className="flex flex-wrap justify-between items-center pb-3 mb-4 gap-4">
        <h2 className="text-lg font-semibold">Market Rep</h2>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="py-2 px-3 border border-gray-200 rounded-md outline-none text-sm w-full sm:w-64"
          />
          <button className="bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap">
            Export As ▾
          </button>
          <select
            value={queryParams.status}
            onChange={(e) => updateQueryParams({ status: e.target.value })}
            className="bg-gray-100 text-gray-700 px-3 w-auto outline-none apperance-none text-sm rounded-md whitespace-nowrap "
          >
            <option value="">Sort: All </option>
            <option value="pending">Sort: Pending</option>
            <option value="expired">Sort: Expired</option>
            <option value="active">Sort: Active</option>
          </select>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#9847FE] text-white px-4 py-2 text-sm cursor-pointer rounded-md"
          >
            + Add a Market Rep
          </button>
        </div>
      </div>
      {/* table */}
      <div className="overflow-x-auto">
        <AddMarketModal
          businessId={businessData?.data?.id}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
        <ReusableTable columns={columns} data={filteredData} />
        {filteredData?.length > 0 && (
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
              {/* <p className="text-sm text-gray-600 ml-4">
            {indexOfFirstItem + 1}-
            {indexOfLastItem > filteredData.length
              ? filteredData.length
              : indexOfLastItem}{" "}
            of {filteredData.length} items
          </p> */}
            </div>
            {/* <div className="flex gap-1">
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
          </div> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewlyAddedUsers;
