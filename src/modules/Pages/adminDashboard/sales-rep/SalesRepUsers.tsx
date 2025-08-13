import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import CaryBinApi from "../../../../services/CarybinBaseUrl";
import { AlertCircle } from "lucide-react";
import CustomTable from "../../../../components/CustomTable";
import { useState } from "react";

interface Coordinates {
  latitude: string;
  longitude: string;
}

interface Profile {
  id: string;
  user_id: string;
  profile_picture: string | null;
  address: string | null;
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
  name: string;
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
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  const query = useQuery<API_RESPONSE>({
    queryKey: ["sales_rep_user", salesId],
    queryFn: async () => {
      let resp = await CaryBinApi.get("/auth/fetch-vendors/" + salesId);
      return resp.data;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  if (query.isLoading) {
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
          <span>Error! Failed to load sales representative data.</span>
          <p className="text-sm mt-1">
            {query.error?.message || "An unknown error occurred."}
          </p>
        </div>
      </div>
    );
  }

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email Address" },
    {
      key: "role.name",
      label: "Role",
      render: (_: any, item: UserData) => item.role.name,
    },
    { key: "phone", label: "Phone Number" },
    { key: "created_at", label: "Date Joined" },
    {
      key: "profile.address",
      label: "Address",
      render: (_: any, item: UserData) =>
        item.profile.address?.trim() || "...address missing",
    },
    {
      key: "business_info.business_name",
      label: "Business Name",
      render: (_: any, item: UserData) => item.business_info.business_name,
    },
    {
      key: "business_info.location",
      label: "Business Location",
      render: (_: any, item: UserData) => item.business_info.location,
    },
  ];

  const actions = [
    {
      key: "view detail",
      label: "View Details",
      action: (item: UserData) => {
        setSelectedUser(item);
        setDialogOpen(true);
      },
    },
  ];

  return (
    <div id="cus-app" data-theme="nord">
      <CustomTable
        columns={columns}
        data={query.data?.data}
        actions={actions}
      />

      {isDialogOpen && (
        <dialog open id="my_modal_1" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Hello!</h3>
            <p className="py-4">
              Press ESC key or click the button below to close
            </p>
            <div className="modal-action">
              <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <button className="btn">Close</button>
              </form>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
