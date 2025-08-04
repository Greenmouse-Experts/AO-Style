import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import CaryBinApi from "../../../services/CarybinBaseUrl";
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
      <div className="max-w-4xl mx-auto my-8 p-6 bg-blue-50 text-blue-700 text-center text-lg font-semibold rounded-lg shadow-md">
        Loading vendor details...
      </div>
    );
  if (query.isError)
    return (
      <div className="max-w-4xl mx-auto my-8 p-6 bg-red-50 text-red-700 text-center text-lg font-semibold rounded-lg shadow-md">
        Error: {query.error.message}
      </div>
    );
  let vendor_details = query.data?.data;
  return (
    <div className="max-w-4xl mx-auto my-10">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
        Vendor Details
      </h2>
      <div className="bg-white p-8 rounded-xl shadow-lg">
        {vendor_details ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-16">
            {/* Basic Information */}
            <div className="col-span-full pb-4 mb-6">
              <h3 className="text-xl font-bold text-gray-800 border-b border-gray-200">
                Basic Information
              </h3>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide">
                Name:
              </p>
              <p className="font-semibold text-gray-800">
                {vendor_details.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide">
                Email:
              </p>
              <p className="font-semibold text-gray-800">
                {vendor_details.email}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide">
                Phone:
              </p>
              <p className="font-semibold text-gray-800">
                {vendor_details.phone}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide">
                Role:
              </p>
              <p className="font-semibold text-gray-800">
                {vendor_details.role?.name || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide">
                Registered On:
              </p>
              <p className="font-semibold text-gray-800">
                {new Date(vendor_details.created_at).toLocaleDateString()}
              </p>
            </div>

            {/* Profile Information */}
            <div className="col-span-full pt-6 pb-4 mb-6">
              <h3 className="text-xl font-bold text-gray-800 border-b border-gray-200">
                Profile Information
              </h3>
            </div>
            {vendor_details.profile?.profile_picture && (
              <div className="col-span-full flex justify-center py-4 mb-6">
                <img
                  src={vendor_details.profile.profile_picture}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-300 shadow-md"
                />
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide">
                Bio:
              </p>
              <p className="font-semibold text-gray-800">
                {vendor_details.profile?.bio || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide">
                Gender:
              </p>
              <p className="font-semibold text-gray-800">
                {vendor_details.profile?.gender || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide">
                Country:
              </p>
              <p className="font-semibold text-gray-800">
                {vendor_details.profile?.country || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide">
                Country Code:
              </p>
              <p className="font-semibold text-gray-800">
                {vendor_details.profile?.country_code || "N/A"}
              </p>
            </div>

            {/* Registration Details */}
            {vendor_details.registered_by && (
              <>
                <div className="col-span-full pt-6 pb-4 mb-6">
                  <h3 className="text-xl font-bold text-gray-800 border-b border-gray-200">
                    Registered By
                  </h3>
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide">
                    Name:
                  </p>
                  <p className="font-semibold text-gray-800">
                    {vendor_details.registered_by.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide">
                    Email:
                  </p>
                  <p className="font-semibold text-gray-800">
                    {vendor_details.registered_by.email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide">
                    Phone:
                  </p>
                  <p className="font-semibold text-gray-800">
                    {vendor_details.registered_by.phone || "N/A"}
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-600 p-4">
            No vendor details found.
          </p>
        )}
      </div>
    </div>
  );
}
