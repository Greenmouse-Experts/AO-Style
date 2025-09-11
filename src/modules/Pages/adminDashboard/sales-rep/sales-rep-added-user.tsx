import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import CaryBinApi from "../../../../services/CarybinBaseUrl";
import { toast } from "react-toastify";
import { useRef } from "react";
import CustomBackbtn from "../../../../components/CustomBackBtn";

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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const accept_kyc = useMutation({
    mutationFn: async (id: string) => {
      const resp = await CaryBinApi.patch(`/onboard/review-kyc/${id}`, {
        is_approved: true,
        // is_rejected: false
      });
      return resp.data as UserDetailsResponse;
    },
    onSuccess: () => {
      toast.success("KYC accepted successfully");
      refetch();
    },
    // onError: () => {
    //   toast.error("Failed to accept KYC");
    // },
  });
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const resp = await CaryBinApi.get(`/auth/user-details/${userId}`);
      return resp.data as UserDetailsResponse;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-200">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-200">
        <div className="alert alert-error shadow-lg">
          <span>Error loading user details</span>
        </div>
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-200">
        <div className="alert alert-warning shadow-lg">
          <span>No user data found</span>
        </div>
      </div>
    );
  }

  const { user, business, kyc } = data.data;

  return (
    <div
      className="container mx-auto px-4 py-8 space-y-8 max-w-5xl"
      data-theme="nord"
    >
      {/* Header */}
      <div className="flex gap-4 items-center mb-8">
        <CustomBackbtn />
        <h1 className="text-3xl font-extrabold text-base-content tracking-tight">
          User Details
        </h1>
      </div>
      <div className="flex flex-col md:flex-row items-center gap-6 mb-8 bg-base-100 rounded-xl shadow-lg p-6">
        <div className="avatar">
          <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden flex items-center justify-center bg-base-200">
            {user.profile.profile_picture ? (
              <img
                src={user.profile.profile_picture}
                alt={user.name}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="avatar-placeholder bg-neutral text-neutral-content w-full h-full flex items-center justify-center">
                <span className="text-3xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-base-content/70 text-lg">{user.role.name}</p>
          <div className="flex gap-2 mt-2">
            <span
              className={`badge px-3 py-2 ${user.is_suspended ? "badge-error" : "badge-success"}`}
            >
              {user.is_suspended ? "Suspended" : "Active"}
            </span>
            {user.is_email_verified && (
              <span className="badge badge-success badge-sm">
                Email Verified
              </span>
            )}
            {user.is_phone_verified && (
              <span className="badge badge-success badge-sm">
                Phone Verified
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* User Information Card */}
        <div className="card card-border shadow-lg bg-base-100 rounded-xl">
          <div className="card-body">
            <h2 className="card-title text-lg font-semibold mb-4">
              User Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <span className="font-semibold w-32">Email:</span>
                <span className="ml-2">{user.email}</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold w-32">Phone:</span>
                <span className="ml-2">{user.phone}</span>
              </div>
              {user.alternative_phone && (
                <div className="flex items-center">
                  <span className="font-semibold w-32">Alt. Phone:</span>
                  <span className="ml-2">{user.alternative_phone}</span>
                </div>
              )}
              <div className="flex items-center">
                <span className="font-semibold w-32">Joined:</span>
                <span className="ml-2">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information Card */}
        <div className="card card-border shadow-lg bg-base-100 rounded-xl">
          <div className="card-body">
            <h2 className="card-title text-lg font-semibold mb-4">
              Profile Details
            </h2>
            <div className="space-y-4">
              {user.profile.bio && (
                <div>
                  <span className="font-semibold">Bio:</span>
                  <p className="mt-1 text-base-content/80">
                    {user.profile.bio}
                  </p>
                </div>
              )}
              {user.profile.date_of_birth && (
                <div className="flex items-center">
                  <span className="font-semibold w-32">Date of Birth:</span>
                  <span className="ml-2">
                    {new Date(user.profile.date_of_birth).toLocaleDateString()}
                  </span>
                </div>
              )}
              {user.profile.gender && (
                <div className="flex items-center">
                  <span className="font-semibold w-32">Gender:</span>
                  <span className="ml-2">{user.profile.gender}</span>
                </div>
              )}
              {user.profile.address && (
                <div>
                  <span className="font-semibold">Address:</span>
                  <p className="mt-1 text-base-content/80">
                    {user.profile.address}
                  </p>
                </div>
              )}
              {user.profile.years_of_experience && (
                <div className="flex items-center">
                  <span className="font-semibold w-32">Experience:</span>
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
          <div className="card card-border shadow-lg bg-base-100 rounded-xl">
            <div className="card-body">
              <h2 className="card-title text-lg font-semibold mb-4">
                Business Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="font-semibold w-40">Business Name:</span>
                  <span className="ml-2">{business.business_name}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold w-40">Industry:</span>
                  <span className="ml-2">
                    {business.industry || "Not specified"}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold w-40">Business Type:</span>
                  <span className="ml-2">{business.business_type}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold w-40">Business Size:</span>
                  <span className="ml-2">
                    {business.business_size || "Not specified"}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold w-40">Location:</span>
                  <span className="ml-2">{business.location}</span>
                </div>
                {business.working_hours && (
                  <div className="flex items-center">
                    <span className="font-semibold w-40">Working Hours:</span>
                    <span className="ml-2">{business.working_hours}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* KYC Information Card */}
        {kyc && (
          <div className="card card-border shadow-lg bg-base-100 rounded-xl">
            <div className="card-body">
              <div className="flex items-center mb-4">
                <h2 className="card-title text-lg font-semibold">
                  KYC Information
                </h2>
                <span
                  className="btn btn-sm ml-auto btn-primary rounded-full shadow"
                  onClick={() => dialogRef.current?.showModal()}
                >
                  View KYC
                </span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="font-semibold w-32">Status:</span>
                  <span
                    className={`badge ml-2 px-3 py-2 ${kyc.is_approved ? "badge-success" : "badge-warning"}`}
                  >
                    {kyc.is_approved ? "Approved" : "Pending"}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold w-32">ID Type:</span>
                  <span className="ml-2">{kyc.id_type}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold w-32">Location:</span>
                  <span className="ml-2">{`${kyc.city}, ${kyc.state}, ${kyc.country}`}</span>
                </div>
                {kyc.disapproval_reason && (
                  <div>
                    <span className="font-semibold">Disapproval Reason:</span>
                    <p className="mt-1 text-error">{kyc.disapproval_reason}</p>
                  </div>
                )}
                <div className="flex items-center">
                  <span className="font-semibold w-32">Reviewed At:</span>
                  <span className="ml-2">
                    {kyc.reviewed_at
                      ? new Date(kyc.reviewed_at).toLocaleDateString()
                      : "Not Reviewed"}
                  </span>
                </div>
                <button
                  onClick={() =>
                    toast.promise(
                      async () => {
                        await accept_kyc.mutateAsync(kyc?.id);
                      },
                      {
                        success: "Kyc approved successfully",
                        pending: "Approving Kyc...",
                        error: "Failed to approve kyc",
                      },
                    )
                  }
                  disabled={kyc?.is_approved || accept_kyc.isPending}
                  className={`btn btn-primary btn-block mt-2 ${kyc?.is_approved ? "btn-disabled" : ""}`}
                >
                  {kyc?.is_approved ? "Approved" : "Approve KYC"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suspension Information */}
      {user.is_suspended && (
        <div className="alert alert-error shadow-lg mt-8">
          <div>
            <h3 className="font-bold text-lg">Account Suspended</h3>
            {user.suspension_reason && <p>Reason: {user.suspension_reason}</p>}
            {user.suspended_at && (
              <p>
                Suspended on: {new Date(user.suspended_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      )}

      <dialog ref={dialogRef} id="my_modal_2" className="modal">
        <div className="modal-box max-w-2xl max-h-[90vh] overflow-y-auto p-0 bg-base-100 rounded-xl shadow-xl">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-base-300 bg-base-100 rounded-t-lg">
            <h3 className="font-bold text-xl">KYC Documents</h3>
            <form method="dialog">
              <button
                className="btn btn-sm btn-circle btn-ghost"
                aria-label="Close"
              >
                ✕
              </button>
            </form>
          </div>

          {/* Modal Content */}
          <div className="px-6 py-4">
            {/* ID Type Information */}
            <div className="flex items-center gap-2 mb-4">
              <span className="badge badge-info text-base px-3 py-2 rounded-lg">
                {data.data.kyc.id_type}
              </span>
              <span className="text-xs text-base-content/60">
                Document Type
              </span>
            </div>

            {/* Document Images Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              {/* Front Document */}
              <div className="flex flex-col items-center bg-base-200 rounded-lg p-3 shadow-sm">
                <span className="font-semibold mb-2 text-sm">Front</span>
                <div className="w-full aspect-video rounded-lg overflow-hidden border border-base-300 bg-base-100 flex items-center justify-center">
                  {data.data.kyc.doc_front ? (
                    <img
                      src={data.data.kyc.doc_front}
                      alt="Front document"
                      className="max-h-40 w-auto object-contain cursor-zoom-in transition-all duration-200 hover:scale-105"
                      onClick={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.classList.toggle("scale-105");
                      }}
                    />
                  ) : (
                    <span className="text-xs text-base-content/60">
                      No image
                    </span>
                  )}
                </div>
              </div>

              {/* Back Document */}
              <div className="flex flex-col items-center bg-base-200 rounded-lg p-3 shadow-sm">
                <span className="font-semibold mb-2 text-sm">Back</span>
                <div className="w-full aspect-video rounded-lg overflow-hidden border border-base-300 bg-base-100 flex items-center justify-center">
                  {data.data.kyc.doc_back ? (
                    <img
                      src={data.data.kyc.doc_back}
                      alt="Back document"
                      className="max-h-40 w-auto object-contain cursor-zoom-in transition-all duration-200 hover:scale-105"
                      onClick={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.classList.toggle("scale-105");
                      }}
                    />
                  ) : (
                    <span className="text-xs text-base-content/60">
                      No image
                    </span>
                  )}
                </div>
              </div>

              {/* Utility Document */}
              <div className="flex flex-col items-center bg-base-200 rounded-lg p-3 shadow-sm">
                <span className="font-semibold mb-2 text-sm">Utility</span>
                <div className="w-full aspect-video rounded-lg overflow-hidden border border-base-300 bg-base-100 flex items-center justify-center">
                  {data.data.kyc.utility_doc ? (
                    <img
                      src={data.data.kyc.utility_doc}
                      alt="Utility document"
                      className="max-h-40 w-auto object-contain cursor-zoom-in transition-all duration-200 hover:scale-105"
                      onClick={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.classList.toggle("scale-105");
                      }}
                    />
                  ) : (
                    <span className="text-xs text-base-content/60">
                      No image
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t border-base-300">
              <form method="dialog">
                <button className="btn btn-ghost">Close</button>
              </form>
              <button
                onClick={() => {
                  toast.promise(
                    async () => {
                      await accept_kyc.mutateAsync(kyc?.id);
                      dialogRef.current?.close();
                    },
                    {
                      success: "KYC approved successfully",
                      pending: "Approving KYC...",
                      error: "Failed to approve KYC",
                    },
                  );
                }}
                disabled={kyc?.is_approved || accept_kyc.isPending}
                className={`btn btn-primary ${kyc?.is_approved ? "btn-disabled" : ""}`}
              >
                {kyc?.is_approved ? "Already Approved" : "Approve KYC"}
              </button>
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}
