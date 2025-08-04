import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import CaryBinApi from "../../../services/CarybinBaseUrl";
import { ChevronLeft } from "lucide-react";

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
      <>
        <div className="p-4 text-center text-gray-800">
          Loading vendor details...
        </div>
      </>
    );
  if (query.isError)
    return <div className="p-4 text-red-500">Error: {query.error.message}</div>;

  let vendor_details = query.data?.data;

  return (
    <>
      <BackButton />
      <h2 className="text-xl font-bold my-5 mx-4 text-gray-800">
        Vendor Details
      </h2>
      <div className="bg-white m-2 p-4 rounded-xl shadow">
        {vendor_details ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            {/* Basic Information */}
            <div className="col-span-full border-b border-current/20 pb-2 mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Basic Information
              </h3>
            </div>

            <div>
              <p className="text-sm text-gray-500">Name:</p>
              <p className="font-medium text-gray-800 mt-2">
                {vendor_details.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email:</p>
              <p className="font-medium text-gray-800 mt-2">
                {vendor_details.email}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone:</p>
              <p className="font-medium text-gray-800 mt-2">
                {vendor_details.phone}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Role:</p>
              <p className="font-medium text-gray-800 mt-2">
                {vendor_details.role?.name || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Registered On:</p>
              <p className="font-medium text-gray-800 mt-2">
                {new Date(vendor_details.created_at).toLocaleDateString()}
              </p>
            </div>

            {/* Profile Information */}
            <div className="col-span-full border-b border-current/20 pb-2 mt-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Profile Information
              </h3>
            </div>

            {vendor_details.profile?.profile_picture && (
              <div className="col-span-full flex justify-center py-2">
                <img
                  src={vendor_details.profile.profile_picture}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border border-gray-200"
                />
              </div>
            )}

            <div>
              <p className="text-sm text-gray-500">Bio:</p>
              <p className="font-medium text-gray-800 mt-2">
                {vendor_details.profile?.bio || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gender:</p>
              <p className="font-medium text-gray-800 mt-2">
                {vendor_details.profile?.gender || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Country:</p>
              <p className="font-medium text-gray-800 mt-2">
                {vendor_details.profile?.country || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Country Code:</p>
              <p className="font-medium text-gray-800 mt-2">
                {vendor_details.profile?.country_code || "N/A"}
              </p>
            </div>

            {/* Registration Details */}
            {vendor_details.registered_by && (
              <>
                <div className="col-span-full border-b border-current/20 pb-2 mt-4 mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Registered By
                  </h3>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Name:</p>
                  <p className="font-medium text-gray-800 mt-2">
                    {vendor_details.registered_by.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email:</p>
                  <p className="font-medium text-gray-800 mt-2">
                    {vendor_details.registered_by.email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone:</p>
                  <p className="font-medium text-gray-800 mt-2">
                    {vendor_details.registered_by.phone || "N/A"}
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-600">No vendor details found.</p>
        )}
      </div>
    </>
  );
}

export const BackButton = () => {
  const nav = useNavigate();
  return (
    <div>
      <button
        onClick={() => {
          console.log("clicked");
          window.history.back();
        }}
        className="p-2 bg-white inline-flex items-center text-md px-4 shadow gap-2 text-gray-800"
      >
        <ChevronLeft size={18} /> Go Back
      </button>
    </div>
  );
};
