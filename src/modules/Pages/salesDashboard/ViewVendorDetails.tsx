import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import CaryBinApi from "../../../services/CarybinBaseUrl";
import {
  ChevronLeft,
  Plus,
  Mail,
  Phone,
  Calendar,
  MapPin,
  User,
  Globe,
} from "lucide-react";

interface API_RESPONSE {
  data: VendorDetails;
  code: number;
  message: string;
}

interface VendorDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: {
    id: string;
    name: string;
    role_group_id: string;
    description: string;
    created_at: string;
    updated_at: string;
    role_id: string;
    deleted_at: null;
  };
  profile: {
    id: string;
    user_id: string;
    profile_picture: string;
    address: null;
    bio: string;
    date_of_birth: null;
    gender: string;
    created_at: string;
    updated_at: string;
    deleted_at: null;
    country: string;
    state: null;
    country_code: string;
    approved_by_admin: null;
    years_of_experience: null;
    measurement: null;
    coordinates: null;
  };
  business_info: {
    kyc: null;
    withdrawal_account: null;
  };
  registered_by: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  created_at: string;
}

export default function ViewVendorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const query = useQuery<API_RESPONSE>({
    queryKey: [id, "vender_details"],
    queryFn: async () => {
      let resp = await CaryBinApi.get(`/auth/vendors/${id}`);
      return resp.data;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  if (query.isFetching)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <div className="text-lg text-gray-700 font-medium animate-pulse">
            Loading vendor details...
          </div>
        </div>
      </div>
    );
  if (query.isError)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 border border-red-200 text-red-600 px-8 py-6 rounded-xl shadow-lg max-w-md">
          <div className="text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
            <p>{query.error.message}</p>
          </div>
        </div>
      </div>
    );

  let vendor_details = query.data?.data;
  const location = useLocation();
  const prevRoute = location.state?.from;
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <BackButton />
          <button
            onClick={() => {
              // const prevRoute =
              //   window.history.state?.usr?.pathname || document.referrer;
              // Check if previous route is "/sales/fashin designers"
              if (
                prevRoute === "/sales/fashion-designers" ||
                (typeof prevRoute === "string" &&
                  prevRoute.includes("/sales/fashion-designers"))
              ) {
                navigate(`/sales/add-style?style_id=${id}`);
              } else {
                navigate(`/sales/add-fabric?vendor_id=${id}`);
              }
            }}
            className="cursor-pointer inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-purple-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Plus size={20} />{" "}
            {prevRoute === "/sales/fashion-designers" ||
            (typeof prevRoute === "string" &&
              prevRoute.includes("/sales/fashion-designers"))
              ? "Add Style"
              : "Add Fabric"}
          </button>
        </div>
        <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-200 overflow-hidden">
          <div className="relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
            <h2 className="text-3xl font-bold text-gray-800 mb-10 pt-4 flex items-center gap-3">
              <div className="w-3 h-8 bg-purple-600 rounded-full"></div>
              Details
            </h2>
          </div>
          {vendor_details ? (
            <div className="space-y-10">
              {/* Profile Picture and Name */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative">
                  <img
                    src={
                      vendor_details.profile?.profile_picture ||
                      "https://ui-avatars.com/api/?name=" +
                        encodeURIComponent(vendor_details.name) +
                        "&background=E5E7EB&color=374151&size=128"
                    }
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-purple-100 shadow-xl"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {vendor_details.name}
                  </h3>
                  <p className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full inline-block">
                    {vendor_details.role?.name || "N/A"}
                  </p>
                </div>
              </div>

              {/* Information Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Basic Information */}
                <div className="bg-gray-50 rounded-2xl p-6 shadow-sm">
                  <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <User size={20} className="text-purple-600" />
                    Basic Information
                  </h4>
                  <dl className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-gray-400" />
                      <div>
                        <dt className="text-xs text-gray-500 uppercase tracking-wide">
                          Email
                        </dt>
                        <dd className="font-medium text-gray-800">
                          {vendor_details.email}
                        </dd>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-gray-400" />
                      <div>
                        <dt className="text-xs text-gray-500 uppercase tracking-wide">
                          Phone
                        </dt>
                        <dd className="font-medium text-gray-800">
                          {vendor_details.phone}
                        </dd>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar size={16} className="text-gray-400" />
                      <div>
                        <dt className="text-xs text-gray-500 uppercase tracking-wide">
                          Registered On
                        </dt>
                        <dd className="font-medium text-gray-800">
                          {new Date(
                            vendor_details.created_at,
                          ).toLocaleDateString()}
                        </dd>
                      </div>
                    </div>
                  </dl>
                </div>

                {/* Profile Information */}
                <div className="bg-gray-50 rounded-2xl p-6 shadow-sm">
                  <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Globe size={20} className="text-purple-600" />
                    Profile Information
                  </h4>
                  <dl className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User size={16} className="text-gray-400" />
                      <div>
                        <dt className="text-xs text-gray-500 uppercase tracking-wide">
                          Gender
                        </dt>
                        <dd className="font-medium text-gray-800">
                          {vendor_details.profile?.gender || "N/A"}
                        </dd>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-gray-400" />
                      <div>
                        <dt className="text-xs text-gray-500 uppercase tracking-wide">
                          Country
                        </dt>
                        <dd className="font-medium text-gray-800">
                          {vendor_details.profile?.country || "N/A"}
                        </dd>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe size={16} className="text-gray-400" />
                      <div>
                        <dt className="text-xs text-gray-500 uppercase tracking-wide">
                          Country Code
                        </dt>
                        <dd className="font-medium text-gray-800">
                          {vendor_details.profile?.country_code || "N/A"}
                        </dd>
                      </div>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Registered By */}
              {vendor_details.registered_by && (
                <div className="bg-gray-50 rounded-2xl p-6 shadow-sm">
                  <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <User size={20} className="text-purple-600" />
                    Registered By
                  </h4>
                  <dl className="flex flex-col md:flex-row md:items-start md:space-x-8 space-y-6 md:space-y-0">
                    <div className="flex-1 min-w-0 flex items-center gap-3">
                      <User size={16} className="text-gray-400" />
                      <div className="min-w-0">
                        <dt className="text-xs text-gray-500 uppercase tracking-wide">
                          Name
                        </dt>
                        <dd className="font-medium text-gray-800 truncate">
                          {vendor_details.registered_by.name || "N/A"}
                        </dd>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 flex items-center gap-3">
                      <Mail size={16} className="text-gray-400" />
                      <div className="min-w-0">
                        <dt className="text-xs text-gray-500 uppercase tracking-wide">
                          Email
                        </dt>
                        <dd className="font-medium text-gray-800 truncate">
                          {vendor_details.registered_by.email || "N/A"}
                        </dd>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 flex items-center gap-3">
                      <Phone size={16} className="text-gray-400" />
                      <div className="min-w-0">
                        <dt className="text-xs text-gray-500 uppercase tracking-wide">
                          Phone
                        </dt>
                        <dd className="font-medium text-gray-800 truncate">
                          {vendor_details.registered_by.phone || "N/A"}
                        </dd>
                      </div>
                    </div>
                  </dl>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-16">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-lg">No vendor details found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const BackButton = () => {
  return (
    <button
      onClick={() => {
        window.history.back();
      }}
      className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-white border border-gray-300 shadow-md hover:shadow-lg hover:bg-gray-50 text-gray-700 font-medium transition-all duration-200 transform hover:scale-105"
    >
      <ChevronLeft size={20} /> Go Back
    </button>
  );
};
