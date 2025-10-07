import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import CaryBinApi from "../../../services/CarybinBaseUrl";

// Keeping only relevant interfaces for displaying purchase data
interface PurchaseItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  created_at: string;
  product_id: string;
  purchase_type: string;
  vendor_amount: number;
  vendor_charge: {
    fabric_vendor_fee: number;
    fashion_designer_fee: number;
  };
  thumbnail_url?: string;
}

interface Purchase {
  items: PurchaseItem[];
  coupon_id: string | null;
  coupon_type: string | null;
  coupon_value: number | null;
}

interface User {
  id: string;
  email: string;
  phone: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
}

interface TransactionData {
  id: string;
  user_id: string;
  purchase_type: string;
  purchase_id: string | null;
  amount: string;
  discount_applied: string;
  payment_status: string;
  transaction_id: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  billing_at_payment: string | null;
  billing_id: string | null;
  interval: string | null;
  currency: string;
  auto_renew: boolean;
  is_renewal: boolean;
  is_upgrade: boolean;
  metadata: any | null;
  purchase: Purchase;
  transaction_type: string | null;
  order_id: string | null;
  user: User;
  subscription_plan: SubscriptionPlan | null;
  billing_info: any | null;
  refunds: any[];
  payment_gateway_logs: any[];
}

interface TransactionResponse {
  statusCode: number;
  data: TransactionData[];
  count: number;
}

export default function ViewTransaction() {
  const { id } = useParams();
  const query = useQuery<TransactionResponse>({
    queryKey: ["transactions_details", id],
    queryFn: async () => {
      let resp = await CaryBinApi.get("/payment/fetch-all", {
        params: {
          q: id,
        },
      });
      return resp.data;
    },
  });

  if (query.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <div className="text-gray-600">Loading transaction...</div>
        </div>
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="bg-white rounded-lg shadow p-6 max-w-md mx-4">
          <div className="text-red-600 font-medium">
            Error loading transaction
          </div>
          <div className="text-gray-600 text-sm mt-1">
            {(query.error as Error).message}
          </div>
          <button
            className="bg-purple-500 p-4 px-6 mt-4"
            onClick={() => query.refetch()}
          >
            refetch
          </button>
        </div>
      </div>
    );
  }

  const transactions = query.data?.data;
  console.log("this is the transaction query", query.data);
  if (!transactions || transactions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="bg-white rounded-lg shadow p-6 max-w-md mx-4 text-center">
          <div className="text-gray-800 font-medium">No transaction found</div>
          <div className="text-gray-600 text-sm mt-1">ID: {id}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Transaction Details
        </h1>

        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-purple-700 text-white px-6 py-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    #{transaction.transaction_id || transaction.id}
                  </h2>
                  <p className="text-gray-300 text-sm">
                    {new Date(transaction.created_at).toLocaleDateString()} at{" "}
                    {new Date(transaction.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                      transaction.payment_status === "completed"
                        ? "bg-green-100 text-green-800"
                        : transaction.payment_status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {transaction.payment_status}
                  </span>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {transaction.currency}{" "}
                      {parseFloat(transaction.amount).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Transaction Info */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Transaction Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-gray-600">Transaction ID</dt>
                    <dd className="font-mono text-sm bg-gray-100 px-2 py-1 rounded mt-1">
                      {transaction.transaction_id || transaction.id}
                    </dd>
                  </div>
                  {transaction.order_id && (
                    <div>
                      <dt className="text-sm text-gray-600">Order ID</dt>
                      <dd className="font-mono text-sm bg-gray-100 px-2 py-1 rounded mt-1">
                        {transaction.order_id}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm text-gray-600">Payment Method</dt>
                    <dd className="font-medium capitalize mt-1">
                      {transaction.payment_method}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">Type</dt>
                    <dd className="font-medium capitalize mt-1">
                      {transaction.transaction_type ||
                        transaction.purchase_type}
                    </dd>
                  </div>
                  {parseFloat(transaction.discount_applied) > 0 && (
                    <div>
                      <dt className="text-sm text-gray-600">
                        Discount Applied
                      </dt>
                      <dd className="font-medium text-green-600 mt-1">
                        {transaction.currency}{" "}
                        {parseFloat(transaction.discount_applied).toFixed(2)}
                      </dd>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-gray-600">Email</dt>
                    <dd className="font-medium mt-1">
                      {transaction.user.email}
                    </dd>
                  </div>
                  {transaction.user.phone && (
                    <div>
                      <dt className="text-sm text-gray-600">Phone</dt>
                      <dd className="font-medium mt-1">
                        {transaction.user.phone}
                      </dd>
                    </div>
                  )}
                </div>
              </div>

              {/* Subscription Details */}
              {transaction.purchase_type === "subscription" && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Subscription Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {transaction.subscription_plan?.name && (
                      <div>
                        <dt className="text-sm text-gray-600">Plan</dt>
                        <dd className="font-medium mt-1">
                          {transaction.subscription_plan.name}
                        </dd>
                      </div>
                    )}
                    {transaction.interval && (
                      <div>
                        <dt className="text-sm text-gray-600">Billing Cycle</dt>
                        <dd className="font-medium capitalize mt-1">
                          {transaction.interval}
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-sm text-gray-600">Auto Renew</dt>
                      <dd className="mt-1">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            transaction.auto_renew
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {transaction.auto_renew ? "Yes" : "No"}
                        </span>
                      </dd>
                    </div>
                    {transaction.is_renewal && (
                      <div>
                        <dt className="text-sm text-gray-600">Renewal</dt>
                        <dd className="mt-1">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Yes
                          </span>
                        </dd>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Items */}
              {transaction.purchase?.items &&
                transaction.purchase.items.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Items ({transaction.purchase.items.length})
                    </h3>
                    <div className="space-y-4">
                      {transaction.purchase.items.map((item) => (
                        <div
                          key={item.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                              <img
                                src={
                                  item.thumbnail_url ||
                                  `https://via.placeholder.com/64x64/6366f1/ffffff?text=${encodeURIComponent(item.name.substring(0, 1))}`
                                }
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">
                                {item.name}
                              </h4>
                              {/* Adjusted grid for better responsiveness on small screens */}
                              <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                                <div>Qty: {item.quantity}</div>
                                <div>
                                  Price: {transaction.currency}{" "}
                                  {item.price.toFixed(2)}
                                </div>
                                <div>Type: {item.purchase_type}</div>
                                <div className="font-medium text-gray-900">
                                  Total: {transaction.currency}{" "}
                                  {(item.price * item.quantity).toFixed(2)}
                                </div>
                              </div>
                              {(item.vendor_charge.fabric_vendor_fee > 0 ||
                                item.vendor_charge.fashion_designer_fee >
                                  0) && (
                                <div className="mt-2 text-xs text-gray-500">
                                  Vendor charges:
                                  {item.vendor_charge.fabric_vendor_fee > 0 &&
                                    ` Fabric: ${transaction.currency}${item.vendor_charge.fabric_vendor_fee.toFixed(2)}`}
                                  {item.vendor_charge.fashion_designer_fee >
                                    0 &&
                                    ` Designer: ${transaction.currency}${item.vendor_charge.fashion_designer_fee.toFixed(2)}`}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Coupon */}
              {transaction.purchase?.coupon_value &&
                transaction.purchase.coupon_value > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-medium text-green-800 mb-2">
                      Coupon Applied
                    </h3>
                    <div className="text-sm text-green-700">
                      <div>
                        Type: {transaction.purchase.coupon_type || "N/A"}
                      </div>
                      <div>
                        Value: {transaction.currency}{" "}
                        {transaction.purchase.coupon_value.toFixed(2)}
                      </div>
                      {transaction.purchase.coupon_id && (
                        <div>ID: {transaction.purchase.coupon_id}</div>
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
