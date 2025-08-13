import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import CaryBinApi from "../../../../services/CarybinBaseUrl";
import { AlertCircle } from "lucide-react"; // Import Lucide icon for error
import CustomTable from "../../../../components/CustomTable";
import { useRef } from "react";

interface Coordinates {
  latitude: string;
  longitude: string;
}

interface Profile {
  id: string;
  user_id: string;
  profile_picture: string | null;
  address: string | null; // ADDRESS
  bio: string | null;
  date_of_birth: null;
  gender: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  country: string;
  state: string | null;
  country_code: string;
  approved_by_admin: null;
  years_of_experience: null;
  measurement: null;
  coordinates: Coordinates | null;
}

interface Role {
  id: string;
  name: string; // This will be used for KYC status indicator (e.g., "See KYC" for Fabric Vendor)
  role_group_id: string;
  description: string;
  created_at: string;
  updated_at: string;
  role_id: string;
  deleted_at: null;
}

interface BusinessInfo {
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
  deleted_at: null;
  country: string;
  state: string;
  country_code: string;
  business_registration_number: null;
  business_type: string;
}

interface UserData {
  id: string;
  name: string; // FULL NAME
  email: string; // EMAIL ADDRESS
  password_hash: string;
  phone: string; // PHONE NUMBER
  is_email_verified: boolean;
  is_phone_verified: boolean;
  created_at: string; // DATE JOINED
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
  profile: Profile;
  role: Role;
  business_info: BusinessInfo;
}

interface API_RESPONSE {
  statusCode: number;
  data: UserData[];
  count: number;
}
export default function SalesRepUsers() {
  const { salesId } = useParams();

  const query = useQuery<API_RESPONSE>({
    queryKey: ["sales_rep_user", salesId],
    queryFn: async () => {
      let resp = await CaryBinApi.get("/auth/fetch-vendors/" + salesId);
      return resp.data;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
  const detailRef = useRef<HTMLDialogElement>(null);

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
  const columns = [
    {
      key: "name",
      label: "Name",
    },
    {
      key: "email",
      label: "Email Address",
    },
    {
      key: "role.name",
      label: "Role",
      render: (_, item: UserData) => {
        return item.role.name;
      },
    },
    {
      key: "phone",
      label: "Phone Number",
    },
    {
      key: "created_at",
      label: "Date Joined",
    },
    {
      key: "profile.address",
      label: "Address",
      render: (_, item: UserData) => {
        return item.profile.address?.trim() || "...address missing";
      },
    },

    {
      key: "business_info.business_name",
      label: "Business Name",
      render: (_, item: UserData) => {
        return item.business_info.business_name;
      },
    },
    {
      key: "business_info.location",
      label: "Business Location",
      render: (_, item: UserData) => {
        return item.business_info.location;
      },
    },
  ];
  // If data is available and not loading/error
  // const mapped_dat = query.data?.data.map((item) => {
  //   return item;
  // });
  console.log(query.data?.data[0]);

  const actions = [
    {
      key: "view detail",
      label: "View Details",
      action: (item: any) => {
        console.log(item);
      },
    },
  ];
  return (
    <div id="cus-app" data-theme="nord">
      {/*{JSON.stringify(query.data?.data)}*/}

      <CustomTable
        columns={columns}
        data={query.data?.data}
        actions={actions}
      />

      <dialog></dialog>
    </div>
  );
}
