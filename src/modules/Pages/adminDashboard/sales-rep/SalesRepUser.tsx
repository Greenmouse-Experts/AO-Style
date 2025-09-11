import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import CaryBinApi from "../../../../services/CarybinBaseUrl";
import { useState } from "react";
interface UserProfile {
  id: string;
  user_id: string;
  profile_picture: string;
  address: string;
  bio: string;
  date_of_birth: string | null;
  gender: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  country: string;
  state: string;
  country_code: string;
  approved_by_admin: string | null;
  years_of_experience: number | null;
  measurement: unknown | null; // Adjust type as needed
  coordinates: {
    latitude: string;
    longitude: string;
  };
}

interface Role {
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
  alternative_phone: string;
  signin_option: string;
  admin_role_id: string | null;
  profile: UserProfile;
  role: Role;
  admin_role: unknown | null; // Adjust type as needed
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
  withdrawal_account: unknown | null; // Adjust type as needed
  kyc: unknown | null; // Adjust type as needed
}

interface SalesRepUserData {
  user: User;
  business: Business;
  kyc: unknown | null; // Adjust type as needed
}

interface SalesRepResponse {
  statusCode: number;
  message: string;
  data: SalesRepUserData;
}
export default function SalesRepUser() {
  const { id } = useParams();
  const [tab, setTab] = useState<"user" | "business">("user");

  const query = useQuery<SalesRepResponse>({
    queryKey: ["sales-rep-user"],
    queryFn: async () => {
      let resp = await CaryBinApi.get("/auth/user-details/" + id);
      return resp.data;
    },
  });
  if (query.isFetching) return <>loading</>;
  if (query.isError) return <>error</>;
  return (
    <div data-theme="nord" id="cus-app " className="p-2 bg-transparent">
      <button className="btn btn-ghost">Go Back</button>
      <div className="tabs tabs-border ">
        <a
          className={`tab  ${tab === "user" ? "tab-active" : ""}`}
          onClick={() => setTab("user")}
        >
          User
        </a>
        <a
          className={`tab ${tab === "business" ? "tab-active" : ""}`}
          onClick={() => setTab("business")}
        >
          Business
        </a>
      </div>
      {/*@ts-ignore*/}
      {tab === "user" ? (
        <UserDetail {...query.data?.data.user} />
      ) : (
        <BusinessDetail {...query.data?.data.business} />
      )}
    </div>
  );
}

const UserDetail = (props: UserProfile) => {
  return <></>;
};
const BusinessDetail = (props: Business) => {
  return <></>;
};
