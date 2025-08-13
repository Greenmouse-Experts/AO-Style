import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import CaryBinApi from "../../../../services/CarybinBaseUrl";
import { AlertCircle } from "lucide-react"; // Import Lucide icon for error

interface API_RESPONSE {
  statusCode: number;
  data: {
    id: string;
    name: string;
    email: string;
    password_hash: string;
    phone: string;
    is_email_verified: boolean;
    is_phone_verified: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: null;
    role_identity: string;
    is_suspended: boolean;
    suspended_by: null;
    suspended_at: null;
    suspension_reason: null;
    referral_source: null;
    alternative_phone: null;
    admin_role_id: null;
    profile: {
      id: string;
      user_id: string;
      profile_picture: null;
      address: null;
      bio: null;
      date_of_birth: null;
      gender: null;
      created_at: string;
      updated_at: string;
      deleted_at: null;
      country: string;
      state: null;
      country_code: string;
      approved_by_admin: null;
      years_of_experience: null;
    };
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
    business_info: {
      id: string;
      user_id: string;
      business_name: string;
      business_size: string;
      timeline: string;
      logo_url: null;
      industry: null;
      working_hours: null;
      location: string;
      created_at: string;
      updated_at: string;
      deleted_at: null;
      country: string;
      state: string;
      country_code: string;
      business_registration_number: null;
      business_type: string;
    };
  }[];
  count: number;
}
export default function SalesRepUsers() {
  const { salesId } = useParams();
  const query = useQuery<API_RESPONSE>({
    queryKey: ["sales_rep_user", salesId],
    queryFn: async () => {
      let resp = await CaryBinApi.get("/auth/vendors?role=fashion-designer");
      return resp.data;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  if (query.isLoading) {
    // Use isLoading for initial fetch, isFetching for all fetches
    return (
      <div
        id="cus-app"
        data-theme="nord"
        className="flex justify-center items-center h-screen p-4 shadow-xl mt-4"
      >
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="ml-2 text-lg">Loading sales representatives...</p>
      </div>
    );
  }

  if (query.isError) {
    return (
      <div
        id="cus-app"
        data-theme="nord"
        className="flex justify-center items-center h-screen p-4 shadow-md"
      >
        <div role="alert" className="alert alert-error max-w-md">
          <AlertCircle className="h-6 w-6" />
          <span className="">
            Error! Failed to load sales representative data.
          </span>
          <p className="text-sm mt-1">
            {query.error?.message || "An unknown error occurred."}
          </p>
          <div className=""></div>
        </div>
      </div>
    );
  }

  // If data is available and not loading/error
  return (
    <div id="cus-app" data-theme="nord">
      {JSON.stringify(query.data?.data)}
    </div>
  );
}
