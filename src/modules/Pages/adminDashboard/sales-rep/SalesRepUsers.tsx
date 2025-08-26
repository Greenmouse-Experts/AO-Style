import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
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
  const [selectedTab, setTab] = useState<string>("fashion-designer");

  const query = useQuery<API_RESPONSE>({
    queryKey: ["sales_rep_user", salesId, selectedTab],
    queryFn: async () => {
      let resp = await CaryBinApi.get("/auth/fetch-vendors/" + salesId, {
        params: {
          role: selectedTab,
        },
      });
      return resp.data;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const nav = useNavigate();

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
    {
      key: "email",
      label: "Email Address",
      render: (_: any, item: UserData) => (
        <div className="max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap ">
          {item.email}
        </div>
      ),
    },
    {
      key: "role.name",
      label: "Role",
      render: (_: any, item: UserData) => item.role.name,
    },
    { key: "phone", label: "Phone Number" },
    { key: "created_at", label: "Date Joined" },
    // {
    //   key: "profile.address",
    //   label: "Address",
    //   render: (_: any, item: UserData) =>
    //     item.profile.address?.trim() || "...address missing",
    // },
    {
      key: "business_info.business_name",
      label: "Business Name",
      render: (_: any, item: UserData) => item.business_info.business_name,
    },
    // {
    //   key: "business_info.location",
    //   label: "Business Location",
    //   render: (_: any, item: UserData) => item.business_info.location,
    // },
  ];

  type UserType =
    | "user"
    | "market-representative"
    | "logistics-agent"
    | "fabric-vendor"
    | "fashion-designer";

  const actions = [
    {
      key: "view detail",
      label: "View Details",
      action: (item: UserData) => {
        let role = item.role.name as UserType;
        let path = role.toLocaleLowerCase().replaceAll(" ", "-");
        let parsed_role = role.toLocaleLowerCase().replaceAll(" ", "-");
        if (parsed_role == "market-representative") {
          path = "sales-rep";
        }
        if (parsed_role == "fashion-designer") {
          path = "tailors";
        }
        nav(`/admin/sales-rep/view-sales/user/${item.id}`);
      },
    },
  ];

  const tabs = [
    { value: undefined, label: "All" },
    {
      value: "fashion-designer",
      label: "Tailors",
    },
    {
      value: "fabric-vendor",
      label: "Vendors",
    },
  ];

  const handleTabChange = (tabValue: string) => {
    setTab(tabValue);
  };

  return (
    <div id="cus-app" data-theme="nord" className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-base-content mb-2">
          Sales Representative Users
        </h1>
        <p className="text-base-content/70">
          Manage and view users under this sales representative
        </p>
      </div>

      {/* Enhanced Tabs */}
      <div className="tabs tabs-lift tabs-primary mb-6" data-theme="nord">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            className={`tab [--tab-border-color:var(--color-primary)] ${selectedTab === tab.value ? "tab-active" : ""}`}
            onClick={() => handleTabChange(tab.value)}
          >
            {tab.label}
            {query.data?.count !== undefined && (
              <span className="badge badge-sm ml-2">{query.data.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Table Section */}
      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title text-lg">
              {tabs.find((tab) => tab.value === selectedTab)?.label} List
            </h2>
            <div className="text-sm text-base-content/70">
              Total: {query.data?.count || 0} users
            </div>
          </div>

          <CustomTable
            columns={columns}
            data={query.data?.data}
            actions={actions}
          />

          {query.data?.data && query.data.data.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-base-content mb-2">
                No {tabs.find((tab) => tab.value === selectedTab)?.label} Found
              </h3>
              <p className="text-base-content/70">
                There are no users in this category yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
