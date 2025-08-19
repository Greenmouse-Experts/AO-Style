import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import CaryBinApi from "../../../services/CarybinBaseUrl";
import { toast } from "react-toastify";
import GoogleMapReact from "google-map-react";
import { MdLocationPin } from "react-icons/md";
import { MapPin } from "lucide-react";

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
  metadata: MetadataItem[];
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
const AnyReactComponent = ({ text }) => (
  <div className="bg-red-500 z-20" data-theme="nord">
    <div className="bg-primary size-12 grid place-items-center   rounded-full border-white border">
      <MapPin />
    </div>
  </div>
);
export default function LogisticMapLocation() {
  const { id } = useParams();
  const query = useQuery<OrderLogisticsData>({
    queryKey: ["logistic", id, "view"],
    queryFn: async () => {
      let resp = await CaryBinApi.get("/orders/" + id);
      console.log(resp.data);
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
  const cordinates = query.data?.data.user.profile.coordinates;

  if (query.isFetching) return <div>Loading...</div>;
  const defaultProps = {
    center: {
      lat: parseFloat(cordinates?.latitude),
      lng: parseFloat(cordinates?.longitude),
    },
    zoom: 11,
  };

  // const defaultProps = {
  //   center: {
  //     lat: 10.99835602,
  //     lng: 77.01502627,
  //   },
  //   zoom: 11,
  // };
  const handleApiLoaded = (map, maps) => {
    // use map and maps objects
  };

  return (
    <div>
      {/*map {id}*/}
      <div className="h-[520px] w-full">
        <GoogleMapReact
          bootstrapURLKeys={{ key: "AIzaSyBstumBKZoQNTHm3Y865tWEHkkFnNiHGGE" }}
          defaultCenter={defaultProps.center}
          defaultZoom={defaultProps.zoom}
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
        >
          <AnyReactComponent
            lat={cordinates?.latitude}
            lng={cordinates?.longitude}
            text="My Marker"
          />
        </GoogleMapReact>
      </div>
    </div>
  );
}
