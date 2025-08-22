import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import CaryBinApi from "../../../services/CarybinBaseUrl";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useItemMap } from "../../../store/useTempStore";
interface MeasurementData {
  full_body: {
    height: number;
    height_unit: string;
    dress_length: number;
    dress_length_unit: string;
  };
  lower_body: {
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
  upper_body: {
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
  customer_name: string;
}

interface MetadataItem {
  color: string;
  quantity: number;
  measurement: MeasurementData[];
  cart_item_id: string;
  customer_name: string;
  customer_email: string;
  style_product_id: string;
  fabric_product_id: string;
  style_product_name: string;
  fabric_product_name: string;
}
interface order_summary {
  order_summary: {
    subtotal: number;
    vat_amount: number;
    coupon_code: string;
    final_total: number;
    postal_code: string;
    delivery_fee: number;
    delivery_city: string;
    delivery_state: string;
    delivery_address: string;
    delivery_country: string;
    total_style_items: number;
    total_fabric_items: number;
  };
}

interface VendorCharge {
  fabric_vendor_fee: number;
  fashion_designer_fee: number;
}

interface PurchaseItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  created_at: string;
  product_id: string;
  purchase_type: string;
  vendor_amount: number;
  vendor_charge: VendorCharge;
}

interface Purchase {
  items: PurchaseItem[];
  coupon_id: null;
  tax_amount: number;
  coupon_type: null;
  coupon_value: null;
  delivery_fee: number;
}

interface PaymentData {
  id: string;
  user_id: string;
  purchase_type: string;
  purchase_id: null;
  amount: string;
  discount_applied: string;
  payment_status: string;
  transaction_id: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  billing_at_payment: null;
  billing_id: null;
  interval: null;
  currency: string;
  auto_renew: boolean;
  is_renewal: boolean;
  is_upgrade: boolean;
  metadata: [MetadataItem, order_summary];
  purchase: Purchase;
  transaction_type: null;
  order_id: null;
}

interface UserProfile {
  id: string;
  user_id: string;
  profile_picture: null;
  address: string;
  bio: null;
  date_of_birth: null;
  gender: null;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  country: string;
  state: string;
  country_code: string;
  approved_by_admin: null;
  years_of_experience: null;
  measurement: MeasurementData;
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
  order_items: OrderItem[];
  logistics_agent: null;
}

interface ProductFabric {
  id: string;
  product_id: string;
  market_id: string;
  weight_per_unit: string;
  location: {};
  local_name: string;
  manufacturer_name: string;
  material_type: string;
  alternative_names: string;
  fabric_texture: string;
  feel_a_like: string;
  quantity: number;
  minimum_yards: string;
  available_colors: string;
  fabric_colors: string;
  photos: string[];
  video_url: string;
  created_at: string;
  updated_at: string;
  deleted_at: null;
}

interface ProductStyle {
  id: string;
  product_id: string;
  estimated_sewing_time: number;
  minimum_fabric_qty: string;
  location: {};
  photos: string[];
  video_url: string;
  created_at: string;
  updated_at: string;
  deleted_at: null;
}

interface Creator {
  id: string;
  name: string;
  role: {
    id: string;
    name: string;
  };
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
  published_at: null;
  archived_at: null;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  creator: Creator;
  fabric: ProductFabric | null;
  style: ProductStyle | null;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: string;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  product: Product;
}
interface LogisticAgent {
  id: string;
  name: string;
}
interface OrderLogisticsData {
  statusCode: number;
  data: {
    id: string;
    user_id: string;
    status: string;
    total_amount: string;
    payment_id: string;
    metadata: null;
    logistics_agent_id: null;
    created_at: string;
    updated_at: string;
    deleted_at: null;
    payment: PaymentData;
    user: User;
    order_items: OrderItem[];
    logistics_agent: LogisticAgent;
  };
}
export default function ViewOrderLogistics() {
  const { id } = useParams();
  const setItem = useItemMap((state) => state.setItem);
  const nav = useNavigate();
  const query = useQuery<OrderLogisticsData>({
    queryKey: ["logistic", id, "view"],
    queryFn: async () => {
      let resp = await CaryBinApi.get("/orders/" + id);
      return resp.data;
    },
  });
  const accept_mutation = useMutation({
    mutationFn: async () => {
      let resp = await CaryBinApi.patch(`/orders/${id}/accept-order`);
      return resp.data;
    },
    onError: (err) => {
      toast.error(err?.data?.message || "failed to accept order");
    },
  });
  if (query.isFetching) {
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
  if (query.isError) {
    return (
      <div
        data-theme="nord"
        className="flex flex-col items-center justify-center min-h-[50vh] gap-4"
        aria-live="assertive"
      >
        <div className="alert alert-error max-w-md">
          <AlertCircle className="w-6 h-6 text-error-content" />
          <span className="text-error-content">
            {query.error?.message || "An error occurred while loading orders"}
          </span>
        </div>
        <button
          className="btn btn-primary btn-md"
          onClick={() => query.refetch()}
          aria-label="Retry loading orders"
        >
          Try Again
        </button>
      </div>
    );
  }
  const order_data = query.data?.data;
  return (
    <div data-theme="nord" className="bg-transparent p-6">
      <div className="bg-base-100 p-4 rounded-md mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Order Details</h2>
          <div className="opacity-65 mt-2 wrap-break-word">Order ID: {id}</div>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-sm">Status:</p>
            <div className="badge badge-success gap-2">Shipped</div>
          </div>
        </div>
        <div>
          <button
            disabled={order_data?.logistics_agent_id != null}
            onClick={async () =>
              toast.promise(async () => await accept_mutation.mutateAsync(), {
                pending: "Accepting order...",
                success: "Order accepted!",
              })
            }
            className="btn btn-primary text-white btn-block mt-3"
          >
            Accept Order
          </button>
          <div className="mt-2 text-primary font-semibold  text-center">
            {order_data?.logistics_agent != null &&
              "order taken by: " + order_data.logistics_agent.name}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-base-100 h-fit p-6 rounded-lg shadow-md flex flex-col gap-6">
          <h3 className="text-xl font-semibold mb-2">Delivery Information</h3>
          <div className="flex flex-col gap-4">
            {/*<div className="flex flex-col gap-2">
              <h4 className="text-lg font-medium text-primary">
                Customer Information
              </h4>
              <p>
                <strong className="text-base-content/70">Name:</strong>{" "}
                {order_data?.user.profile.name || "N/A"}
              </p>
              <p>
                <strong className="text-base-content/70">Email:</strong>{" "}
                <span className="wrap-anywhere">
                  {order_data?.user.email || "N/A"}
                </span>
              </p>
              <p>
                <strong className="text-base-content/70">Phone:</strong>{" "}
                {order_data?.user.phone || "N/A"}
              </p>
            </div>*/}
            {/*<div className="divider"></div>*/}
            <div className="flex flex-col gap-2">
              <h4 className="text-lg font-medium text-primary">
                Delivery Address
              </h4>
              <p>
                <strong className="text-base-content/70">Address:</strong>{" "}
                {/*{order_data?.payment.metadata || "N/A"}*/}
                {
                  order_data?.payment.metadata[1]?.order_summary
                    .delivery_address
                }
              </p>
              <p>
                <strong className="text-base-content/70">City:</strong>{" "}
                {order_data?.payment.metadata[1]?.order_summary.delivery_city ||
                  "N/A"}
              </p>
              <p>
                <strong className="text-base-content/70">State:</strong>{" "}
                {order_data?.payment.metadata[1]?.order_summary
                  .delivery_state || "N/A"}
              </p>
              <p>
                <strong className="text-base-content/70">Country:</strong>{" "}
                {order_data?.payment.metadata[1]?.order_summary
                  .delivery_country || "N/A"}
              </p>
              <p>
                <strong className="text-base-content/70">Zip Code:</strong>{" "}
                {order_data?.payment.metadata[1]?.order_summary.postal_code ||
                  "N/A"}
              </p>
            </div>
            <Link
              to={`/logistics/orders/${id}/map`}
              className="btn btn-primary"
            >
              See On Map
            </Link>
          </div>
        </div>

        <div className="lg:col-span-2 bg-base-100 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Ordered Items</h3>
          <div className="flex flex-col gap-4">
            {order_data?.order_items.map((item: OrderItem) => (
              <div
                key={item.id}
                className="card compact bg-base-100 shadow-md border border-base-200"
              >
                <div className="flex flex-row items-center space-x-4 p-4">
                  <div className="avatar">
                    <div className="w-20 rounded">
                      {item.product.style?.photos?.[0] ? (
                        <img
                          src={item.product.style.photos[0]}
                          alt={item.product.name}
                        />
                      ) : item.product.fabric?.photos?.[0] ? (
                        <img
                          src={item.product.fabric.photos[0]}
                          alt={item.product.name}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                          No Image
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="card-body">
                    <h2 className="card-title">{item.product.name}</h2>
                    <p className="text-sm opacity-50">
                      Quantity: {item.quantity}
                    </p>
                    <p className="text-sm">
                      <p className="label">Pickup Address:</p>
                      <span className="mt-2 block">
                        {item.product.creator.profile.address}
                      </span>
                    </p>
                    <div className="card-actions justify-end">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          setItem(item);
                          nav(`/logistics/orders/item/${item.id}/map`);
                        }}
                      >
                        View pickup
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
