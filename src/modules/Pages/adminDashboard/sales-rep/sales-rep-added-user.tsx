import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import CaryBinApi from "../../../../services/CarybinBaseUrl";

interface UserProfile {
  id: string;
  user_id: string;
  profile_picture: string | null;
  address: string | null;
  bio: string;
  date_of_birth: string | null;
  gender: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  country: string | null;
  state: string | null;
  country_code: string | null;
  approved_by_admin: string | null;
  years_of_experience: string | null;
  measurement: string | null;
  coordinates: string | null;
}

interface UserRole {
  id: string;
  name: string;
  role_group_id: string;
  description: string;
  created_at: string;
  updated_at: string;
  role_id: string;
  deleted_at: string | null;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  role_identity: string;
  is_suspended: boolean;
  suspended_by: string | null;
  suspended_at: string | null;
  suspension_reason: string | null;
  referral_source: string | null;
  alternative_phone: string | null;
  signin_option: string;
  admin_role_id: string | null;
  profile: UserProfile;
  role: UserRole;
  admin_role: string | null;
}

interface Kyc {
  id: string;
  business_id: string;
  user_id: string;
  doc_front: string;
  doc_back: string;
  utility_doc: string;
  location: string;
  state: string;
  city: string;
  country: string;
  country_code: string;
  id_type: string;
  is_approved: boolean;
  disapproval_reason: string | null;
  reviewed_by: string;
  reviewed_at: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface Business {
  id: string;
  user_id: string;
  business_name: string;
  business_size: string | null;
  timeline: string;
  logo_url: string | null;
  industry: string | null;
  working_hours: string | null;
  location: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  country: string;
  state: string;
  country_code: string;
  business_registration_number: string | null;
  business_type: string;
  withdrawal_account: string | null;
  kyc: Kyc;
}

interface UserDetailsResponse {
  statusCode: number;
  message: string;
  data: {
    user: User;
    business: Business;
    kyc: Kyc;
  };
}

export default function SalesRepAddedUser() {
  const { userId } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const resp = await CaryBinApi.get(`/auth/user-details/${userId}`);
      return resp.data as UserDetailsResponse;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Error loading user details</span>
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="alert alert-warning">
        <span>No user data found</span>
      </div>
    );
  }

  const { user, business, kyc } = data.data;

  return (
    <div className="container mx-auto p-6 space-y-6" data-theme="nord">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-base-content mb-2">
          User Details
        </h1>
      </div>
      <div className="flex items-center gap-4 mb-6">
        <div className="avatar">
          <div className="w-16 h-16 rounded-full">
            {user.profile.profile_picture ? (
              <img src={user.profile.profile_picture} alt={user.name} />
            ) : (
              <div className="avatar-placeholder bg-neutral text-neutral-content">
                <span className="text-xl">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-base-content/70">{user.role.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Information Card */}
        <div className="card card-border">
          <div className="card-body">
            <h2 className="card-title">User Information</h2>
            <div className="space-y-3">
              <div>
                <span className="font-semibold">Email:</span>
                <span className="ml-2">{user.email}</span>
                {user.is_email_verified && (
                  <span className="badge badge-success badge-sm ml-2">
                    Verified
                  </span>
                )}
              </div>
              <div>
                <span className="font-semibold">Phone:</span>
                <span className="ml-2">{user.phone}</span>
                {user.is_phone_verified && (
                  <span className="badge badge-success badge-sm ml-2">
                    Verified
                  </span>
                )}
              </div>
              {user.alternative_phone && (
                <div>
                  <span className="font-semibold">Alternative Phone:</span>
                  <span className="ml-2">{user.alternative_phone}</span>
                </div>
              )}
              <div>
                <span className="font-semibold">Status:</span>
                <span
                  className={`badge ml-2 ${user.is_suspended ? "badge-error" : "badge-success"}`}
                >
                  {user.is_suspended ? "Suspended" : "Active"}
                </span>
              </div>
              <div>
                <span className="font-semibold">Joined:</span>
                <span className="ml-2">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information Card */}
        <div className="card card-border">
          <div className="card-body">
            <h2 className="card-title">Profile Details</h2>
            <div className="space-y-3">
              {user.profile.bio && (
                <div>
                  <span className="font-semibold">Bio:</span>
                  <p className="mt-1">{user.profile.bio}</p>
                </div>
              )}
              {user.profile.date_of_birth && (
                <div>
                  <span className="font-semibold">Date of Birth:</span>
                  <span className="ml-2">
                    {new Date(user.profile.date_of_birth).toLocaleDateString()}
                  </span>
                </div>
              )}
              {user.profile.gender && (
                <div>
                  <span className="font-semibold">Gender:</span>
                  <span className="ml-2">{user.profile.gender}</span>
                </div>
              )}
              {user.profile.address && (
                <div>
                  <span className="font-semibold">Address:</span>
                  <p className="mt-1">{user.profile.address}</p>
                </div>
              )}
              {user.profile.years_of_experience && (
                <div>
                  <span className="font-semibold">Experience:</span>
                  <span className="ml-2">
                    {user.profile.years_of_experience} years
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Business Information Card */}
        {business && (
          <div className="card card-border">
            <div className="card-body">
              <h2 className="card-title">Business Information</h2>
              <div className="space-y-3">
                <div>
                  <span className="font-semibold">Business Name:</span>
                  <span className="ml-2">{business.business_name}</span>
                </div>
                <div>
                  <span className="font-semibold">Industry:</span>
                  <span className="ml-2">
                    {business.industry || "Not specified"}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Business Type:</span>
                  <span className="ml-2">{business.business_type}</span>
                </div>
                <div>
                  <span className="font-semibold">Business Size:</span>
                  <span className="ml-2">
                    {business.business_size || "Not specified"}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Location:</span>
                  <span className="ml-2">{business.location}</span>
                </div>
                {business.working_hours && (
                  <div>
                    <span className="font-semibold">Working Hours:</span>
                    <span className="ml-2">{business.working_hours}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* KYC Information Card */}
        {kyc && (
          <div className="card card-border">
            <div className="card-body">
              <h2 className="card-title">KYC Information</h2>
              <div className="space-y-3">
                <div>
                  <span className="font-semibold">Status:</span>
                  <span
                    className={`badge ml-2 ${kyc.is_approved ? "badge-success" : "badge-warning"}`}
                  >
                    {kyc.is_approved ? "Approved" : "Pending"}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">ID Type:</span>
                  <span className="ml-2">{kyc.id_type}</span>
                </div>
                <div>
                  <span className="font-semibold">Location:</span>
                  <span className="ml-2">{`${kyc.city}, ${kyc.state}, ${kyc.country}`}</span>
                </div>
                {kyc.disapproval_reason && (
                  <div>
                    <span className="font-semibold">Disapproval Reason:</span>
                    <p className="mt-1 text-error">{kyc.disapproval_reason}</p>
                  </div>
                )}
                <div>
                  <span className="font-semibold">Reviewed At:</span>
                  <span className="ml-2">
                    {new Date(kyc.reviewed_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suspension Information */}
      {user.is_suspended && (
        <div className="alert alert-error">
          <div>
            <h3 className="font-bold">Account Suspended</h3>
            {user.suspension_reason && <p>Reason: {user.suspension_reason}</p>}
            {user.suspended_at && (
              <p>
                Suspended on: {new Date(user.suspended_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
