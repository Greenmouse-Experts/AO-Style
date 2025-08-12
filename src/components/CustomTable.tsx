import { MenuIcon } from "lucide-react";
import CaryBinApi from "../services/CarybinBaseUrl";

type columnType = {
  key: string;
  label: string;
};

interface UserProfile {
  id: string;
  user_id: string;
  profile_picture: string | null;
  address: string;
  bio: string | null;
  date_of_birth: string | null;
  gender: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  country: string;
  state: string | null;
  country_code: string;
  approved_by_admin: string | null;
  years_of_experience: string;
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
  referral_source: string;
  alternative_phone: string;
  signin_option: string;
  admin_role_id: string | null;
  profile: UserProfile;
  role: UserRole;
  admin_role: any | null;
}
interface API_RESPONSE {
  data: {
    user: User;
    business: any;
    kyc: any;
  };
}

interface CustomTableProps {
  data?: any[];
  columns?: columnType[];
  actions?: any[];
  user?: API_RESPONSE;
}

export default function CustomTable(props: CustomTableProps) {
  return (
    <div data-theme="" className="p-2 " id="cus-app">
      <div className="overflow-x-auto">
        <table className="table">
          {/* head */}
          <thead>
            <tr>
              {props.columns &&
                props.columns.map((column) => (
                  <th className="capitalize">{column.label}</th>
                ))}
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {props.data &&
              props.data.map((item, rowIdx) => (
                <tr key={rowIdx}>
                  {props.columns?.map((col, colIdx) => (
                    <td key={colIdx}>{item[col.key]}</td>
                  ))}
                  <td>
                    <div className="dropdown dropdown-end">
                      <div
                        tabIndex={0}
                        role="button"
                        className="btn btn-circle btn-ghost m-1"
                      >
                        <MenuIcon />
                      </div>
                      <ul
                        tabIndex={0}
                        className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
                      >
                        <li
                          onClick={async () => {
                            return console.log(
                              "Item clicked",
                              // item,
                              props?.user?.data,
                            );
                            let resp = await CaryBinApi.get(
                              "/manage-style/" + item.id,
                              {
                                headers: {
                                  "business-id": props?.user?.data.user.id,
                                },
                              },
                            );
                            const style = await resp.json();
                            console.log(style);
                          }}
                        >
                          <a>View Style</a>
                        </li>
                        {/*<li>
                          <a>Item 2</a>
                        </li>*/}
                      </ul>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
