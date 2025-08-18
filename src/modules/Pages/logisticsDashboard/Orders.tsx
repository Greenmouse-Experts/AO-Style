import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle, Eye, Loader2 } from "lucide-react"; // Import Lucide Icons
import CaryBinApi from "../../../services/CarybinBaseUrl";
import CustomTable from "../../../components/CustomTable";
import { useNavigate } from "react-router-dom";

// Interfaces (unchanged from original)
// Interfaces
interface Measurement {
  full_body?: {
    height: number;
    height_unit: string;
    dress_length: number;
    dress_length_unit: string;
  };
  lower_body?: {
    trouser_length: number;
    hip_circumference: number;
    knee_circumference: number;
    thigh_circumference: number;
    trouser_length_unit: string;
    waist_circumference: number;
    hip_circumference_unit: string;
    knee_circumference_unit: string;
    thigh_circumference_unit: string;
    waist_circumference_unit: string;
  };
  upper_body?: {
    sleeve_length: number;
    shoulder_width: number;
    bust_circumference: number;
    sleeve_length_unit: string;
    bicep_circumference: number;
    shoulder_width_unit: string;
    waist_circumference: number;
    armhole_circumference: number;
    bust_circumference_unit: string;
    bicep_circumference_unit: string;
    waist_circumference_unit: string;
    armhole_circumference_unit: string;
  };
  customer_name?: string;
}

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
  state: string;
  country_code: string;
  approved_by_admin: string | null;
  years_of_experience: string | null;
  measurement: Measurement;
  coordinates: {
    latitude: string;
    longitude: string;
  };
}

interface User {
  id: string;
  email: string;
  phone: string;
  profile: UserProfile;
}

interface Product {
  id: string;
  business_id: string;
  category_id: string;
  creator_id: string;
  name: string;
  sku: string;
  description: string;
  gender: string;
  tags: [];
  price: string;
  original_price: string;
  currency: string;
  type: string;
  status: string;
  approval_status: string;
  published_at: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  fabric: any | null; // Placeholder, adjust if specific fabric interface is known
  style: any | null; // Placeholder, adjust if specific style interface is known
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  product: Product;
}

interface Order {
  id: string;
  user_id: string;
  status: string;
  total_amount: string;
  payment_id: string;
  metadata: any | null;
  logistics_agent_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  payment: any; // Placeholder, adjust if specific payment interface is known
  user: User;
  logistics_agent: any | null;
  order_items: OrderItem[];
}

interface OrderRequestsResponse {
  statusCode: number;
  data: Order[];
  count: number;
}

export default function OrderRequests() {
  const navigate = useNavigate();
  const { data, isFetching, isError, error, refetch } =
    useQuery<OrderRequestsResponse>({
      queryKey: ["logistics", "orders"],
      queryFn: async () => {
        const resp = await CaryBinApi.get("/orders/available-orders");
        return resp.data;
      },
    });

  // Loading State
  if (isFetching) {
    return (
      <div
        data-theme="nord"
        className="flex flex-col items-center justify-center min-h-[50vh] gap-4"
        aria-live="polite"
      >
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="text-base-content text-lg">Loading Orders...</span>
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div
        data-theme="nord"
        className="flex flex-col items-center justify-center min-h-[50vh] gap-4"
        aria-live="assertive"
      >
        <div className="alert alert-error max-w-md">
          <AlertCircle className="w-6 h-6 text-error-content" />
          <span className="text-error-content">
            {error?.message || "An error occurred while loading orders"}
          </span>
        </div>
        <button
          className="btn btn-primary btn-md"
          onClick={() => refetch()}
          aria-label="Retry loading orders"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Columns
  const columns: {
    key: string;
    label: string;
    render?: (_, item: Order) => JSX.Element;
  }[] = [
    {
      key: "id",
      label: "id",
      render: (_, item) => {
        return (
          <div className=" w-[80px] overflow-ellipsis" data-theme="nord">
            {item.id}
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (_, item) => {
        return (
          <div className={getStatusBadgeClass(item.status)}>{item.status}</div>
        );
      },
    },
    {
      key: "amount",
      label: "Amount",
      render: (_, item) => {
        return <>{item.total_amount}</>;
      },
    },
    {
      key: "logistic",
      label: "logistic Agent",
      render: (_, item) => {
        return <>{item.logistics_agent}</>;
      },
    },
    {
      key: "logistic",
      label: "logistic ID",
      render: (_, item) => {
        return <>{item.total_amount}</>;
      },
    },
  ];

  // Helper function to map order status to badge classes
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "badge-warning";
      case "completed":
        return "badge-success";
      case "cancelled":
        return "badge-error";
      default:
        return "badge-neutral";
    }
  };

  // Actions
  interface ActionConfig {
    key: string;
    label: string;
    icon: JSX.Element; // Assuming icons are JSX elements
    action: (item: Order) => void;
  }

  const actions: ActionConfig[] = [
    {
      key: "view",
      label: "View",
      icon: <Eye className="w-4 h-4 text-primary" />,
      action: (item: Order) => {
        console.log(item, "view");
        // navigate(`/logistics/orders/${item.id}`)
      },
    },
    {
      key: "accept",
      label: "Accept Order",
      icon: <CheckCircle className="w-4 h-4 text-success" />,
      action: (item: Order) => {
        // Placeholder for accept order logic
        console.log(`Accepting order ${item.id}`);
        // navigate(`/logistics/orders/${item.id}`);
      },
    },
  ];

  return (
    <div data-theme="nord" className="min-h-screen flex flex-col  bg-base-100">
      <div className="p-4 rounded-box outline outline-current/20 m-4">
        <h2 className="font-bold text-2xl text-base-content mb-2">
          Orders Available
        </h2>
        <div className="breadcrumbs text-base-content">
          <ul>
            <li>Dashboard</li>
            <li>Orders</li>
          </ul>
        </div>
      </div>
      <CustomTable data={data?.data} actions={actions} columns={columns} />
    </div>
  );
}
