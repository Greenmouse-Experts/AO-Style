import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "react-router-dom";
import CaryBinApi from "../../../../services/CarybinBaseUrl";
import { Loader } from "lucide-react";
import ReusableTable from "../components/ReusableTable";
import { columns } from "./Orders";
import { useRef, useState } from "react";

interface VendorDataType {
  id: string;
  name: string;
  email: string;
  phone: string;
  alternative_phone: string | null;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  created_at: string;
  updated_at: string;
  role: { name: string; role_id: string };
  admin_role: null;
  profile: {
    bio: string | null;
    address: string;
    profile_picture: string | null;
    gender: string | null;
    date_of_birth: string | null;
    approved_by_admin: string | null;
  };
  business_contacts: [];
  location: string;
  dateJoined: string;
}
export default function ViewVendorOrders() {
  const { id } = useParams();
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeReviewModal, setActiveReviewModal] = useState(null);
  const user = location?.state?.info as VendorDataType;
  const order_query = useQuery({
    queryKey: [id, "vendor_orders"],
    queryFn: async () => {
      let resp = await CaryBinApi.get(
        `/orders/fetch-vendor-orders?user_id=${id}`,
      );
      return resp.data;
    },
  });
  const filteredData = order_query?.data?.data.filter((order) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      order.id?.toLowerCase().includes(searchLower) ||
      order.payment?.transaction_id?.toLowerCase().includes(searchLower) ||
      order.payment?.user?.email?.toLowerCase().includes(searchLower) ||
      order.payment?.purchase?.items?.[0]?.name
        ?.toLowerCase()
        .includes(searchLower) ||
      order.status?.toLowerCase().includes(searchLower)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  console.log(filteredData.length);

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
  return (
    <div>
      {/*<>Order summary</>
      <div>Orders for {user.name}</div>*/}

      <div className="bg-white p-6 rounded-xl overflow-x-auto">
        <div className="flex flex-wrap justify-between items-center pb-3 gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <h2 className="text-lg font-semibold">{user.name} Orders</h2>
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="py-2 px-3 border border-gray-200 rounded-md outline-none text-sm w-full sm:w-64"
            />
            <select className="py-2 px-3 border border-gray-200 rounded-md outline-none text-sm w-auto">
              <option>Filter</option>
            </select>
            <select className="py-2 px-3 border border-gray-200 rounded-md outline-none text-sm w-auto">
              <option>Bulk Action</option>
            </select>
          </div>
        </div>
        {order_query.isFetching ? (
          <div className="p-2 text-lg ">loading orders...</div>
        ) : (
          <ReusableTable columns={columns} data={currentItems} />
        )}
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center">
            <p className="text-sm text-gray-600">Items per page: </p>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="py-2 px-3 border border-gray-200 ml-2 rounded-md outline-none text-sm w-auto"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
            <p className="text-sm text-gray-600 ml-4">
              {indexOfFirstItem + 1}-
              {indexOfLastItem > filteredData.length
                ? filteredData.length
                : indexOfLastItem}{" "}
              of {filteredData.length} items
            </p>
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
}
