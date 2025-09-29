import { useState, useRef } from "react";
import { Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { FaEllipsisH } from "react-icons/fa";
import ReusableTable from "../adminDashboard/components/ReusableTable";
import useGetAllMarketRepVendor from "../../../hooks/marketRep/useGetAllReps";
import useQueryParams from "../../../hooks/useQueryParams";
import useUpdatedEffect from "../../../hooks/useUpdatedEffect";

import useDebounce from "../../../hooks/useDebounce";
import { useMemo } from "react";
import { formatDateStr } from "../../../lib/helper";
import CustomTable from "../../../components/CustomTable";

export default function FabricVendorPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All Fabric Vendors");
  const dropdownRef = useRef(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const nav = useNavigate();
  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const { queryParams, updateQueryParams, clearAllFilters } = useQueryParams({
    "pagination[page]": 1,
    "pagination[limit]": 10,
  });

  const { data: getAllFabVendorData, isPending } = useGetAllMarketRepVendor(
    {
      ...queryParams,
    },
    "fashion-designer",
  );

  const [queryString, setQueryString] = useState(queryParams.q);

  const debouncedSearchTerm = useDebounce(queryString ?? "", 1000);

  useUpdatedEffect(() => {
    // update search params with undefined if debouncedSearchTerm is an empty string
    updateQueryParams({
      q: debouncedSearchTerm.trim() || undefined,
      "pagination[page]": 1,
    });
  }, [debouncedSearchTerm]);

  console.log(getAllFabVendorData);

  const fabVendorData = useMemo(
    () =>
      getAllFabVendorData?.data
        ? getAllFabVendorData?.data.map((details) => {
            return {
              ...details,
              name: `${details?.name}`,
              businessName: `${details?.business_info?.business_name}`,
              date: `${
                details?.created_at
                  ? formatDateStr(details?.created_at.split(".").shift())
                  : ""
              }`,
            };
          })
        : [],
    [getAllFabVendorData?.data],
  );

  const columns = [
    // { key: "id", label: "#" },
    { key: "name", label: "Name" },
    { key: "businessName", label: "Business Name" },
    // { key: "marketplace", label: "Marketplace" },
    { key: "date", label: "Date Added" },
    { key: "email", label: "Email" },
  ];
  const action = [
    {
      key: "view",
      label: "view",
      action: (row) => {
        nav(`/sales/view-vendor/${row.id}`, {
          state: { from: location.pathname },
        });
      },
    },
  ];

  const totalPages = Math.ceil(
    getAllFabVendorData?.count / (queryParams["pagination[limit]"] ?? 10),
  );

  return (
    <div>
      <div className="bg-white px-4 sm:px-6 py-4 mb-6 relative">
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center space-y-3 sm:space-y-0">
          <h1 className="text-xl sm:text-2xl font-medium">Fashion Designers</h1>
          <Link to="/sales/add-fashion-designers" className="w-full sm:w-auto">
            <button className="bg-gradient text-white px-6 sm:px-8 py-3 sm:py-3 cursor-pointer rounded-md hover:bg-purple-600 transition w-full sm:w-auto">
              Add Fashion Designers
            </button>
          </Link>
        </div>
        <p className="text-gray-500 mt-2 text-sm sm:text-base">
          <Link to="/sales" className="text-blue-500 hover:underline">
            Dashboard
          </Link>{" "}
          &gt; Fashion Designers
        </p>
      </div>

      {/* Filter & Search Section */}
      <div className="bg-white p-4 rounded-lg overflow-x-auto">
        <div className="flex flex-wrap justify-end items-center pb-3 mb-4 gap-4">
          {/* Search & Sorting */}
          <div className="flex flex-wrap justify-end gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search"
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-md outline-none w-full sm:w-64"
                value={queryString}
                onChange={(evt) =>
                  setQueryString(
                    evt.target.value ? evt.target.value : undefined,
                  )
                }
              />
            </div>
            <button className="px-4 py-2 bg-gray-200 rounded-md whitespace-nowrap">
              Export As ▼
            </button>
            <button className="px-4 py-2 bg-gray-200 rounded-md whitespace-nowrap">
              Sort: Newest First ▼
            </button>
          </div>
        </div>

        {/* Vendors Table */}

        {/* Table Section */}
        <div className="overflow-x-auto">
          {/* <ReusableTable
            columns={columns}
            data={fabVendorData || []}
            loading={isPending}
          />*/}

          <CustomTable
            columns={columns}
            data={fabVendorData || []}
            actions={action}
          />
        </div>

        {!fabVendorData?.length && !isPending && (
          <p className="flex-1 text-center text-sm md:text-sm">
            No fashion designers found.
          </p>
        )}

        {fabVendorData?.length ? (
          <div className="flex  justify-between items-center mt-4">
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
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
