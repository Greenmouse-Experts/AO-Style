import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "react-router-dom";
import CaryBinApi from "../../../services/CarybinBaseUrl";
import CustomBackbtn from "../../../components/CustomBackBtn";

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

// Withdrawal interface based on your sample data
interface WithdrawalData {
  id: string;
  user_id: string;
  amount: string;
  created_at: string;
  currency: string;
  deleted_at: string | null;
  notes: string | null;
  processed_at: string | null;
  processed_by: string | null;
  status: string;
  updated_at: string;
  user_id_ref?: string;
}

export default function ViewTransaction() {
  const { id } = useParams();
  const location = useLocation();

  // Get query params from URL
  const searchParams = new URLSearchParams(location.search);
  const type = searchParams.get("type");

  // Determine endpoint and queryKey based on type
  let endpoint: string;
  let queryKey: (string | undefined)[];

  if (type === "withdrawal") {
    // For withdrawal, endpoint is /withdraw/:id and no query param
    endpoint = `/withdraw/${id}`;
    queryKey = ["withdraw_details", id];
  } else {
    // For payment, endpoint is /payment/fetch-all?q=:id
    endpoint = "/payment/fetch-all";
    queryKey = ["transactions_details", id];
  }

  const query = useQuery<any>({
    queryKey,
    queryFn: async () => {
      if (type === "withdrawal") {
        // GET /withdraw/:id
        let resp = await CaryBinApi.get(endpoint);
        console.log("Withdrawal data", resp.data);
        // Withdrawal endpoint returns { statusCode, data: { ... } }
        return resp.data;
      } else {
        // GET /payment/fetch-all?q=:id
        let resp = await CaryBinApi.get(endpoint, {
          params: {
            q: id,
          },
        });
        return resp.data;
      }
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

  // Withdrawal UI
  if (type === "withdrawal") {
    const withdrawal: WithdrawalData | undefined = query.data?.data;
    if (!withdrawal) {
      return (
        <div className="min-h-screen bg-gray-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow p-6 max-w-md mx-4 text-center">
            <div className="text-gray-800 font-medium">No withdrawal found</div>
            <div className="text-gray-600 text-sm mt-1">ID: {id}</div>
          </div>
        </div>
      );
    }

    // Parse notes if present and JSON
    let notesObj: any = null;
    if (withdrawal.notes) {
      try {
        notesObj = JSON.parse(withdrawal.notes);
      } catch (e) {
        notesObj = withdrawal.notes;
      }
    }

    return (
      <>
        <CustomBackbtn />
        <div className="min-h-screen bg-gray-50 py-6 px-4">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Withdrawal Details
            </h1>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="bg-purple-700 text-white px-6 py-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {withdrawal.id.toUpperCase()}
                    </h2>
                    <p className="text-gray-300 text-sm">
                      {new Date(withdrawal.created_at).toLocaleDateString()} at{" "}
                      {new Date(withdrawal.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                        withdrawal.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : withdrawal.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {withdrawal.status}
                    </span>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {withdrawal.currency}{" "}
                        {parseFloat(withdrawal.amount)?.toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          },
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-8">
                {/* Withdrawal Info */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Withdrawal Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-gray-600">Withdrawal ID</dt>
                      <dd className="font-mono text-sm px-2 py-1 rounded mt-1">
                        {withdrawal.id
                          .replace(/-/g, "")
                          .slice(0, 12)
                          .toUpperCase()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">User ID</dt>
                      <dd className="font-mono text-sm bg-gray-100 px-2 py-1 rounded mt-1">
                        {withdrawal.user_id
                          .replace(/-/g, "")
                          .slice(0, 12)
                          .toUpperCase()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Amount</dt>
                      <dd className="font-medium mt-1">
                        {withdrawal.currency}{" "}
                        {parseFloat(withdrawal.amount)?.toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          },
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Status</dt>
                      <dd className="font-medium mt-1 capitalize">
                        {withdrawal.status}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Created At</dt>
                      <dd className="font-medium mt-1">
                        {new Date(withdrawal.created_at)?.toLocaleString()}
                      </dd>
                    </div>
                    {withdrawal.processed_at && (
                      <div>
                        <dt className="text-sm text-gray-600">Processed At</dt>
                        <dd className="font-medium mt-1">
                          {new Date(withdrawal.processed_at)?.toLocaleString()}
                        </dd>
                      </div>
                    )}
                    {withdrawal.processed_by && (
                      <div>
                        <dt className="text-sm text-gray-600">Processed By</dt>
                        <dd className="font-mono text-sm bg-gray-100 px-2 py-1 rounded mt-1">
                          {withdrawal.processed_by
                            .replace(/-/g, "")
                            .slice(0, 12)
                            .toUpperCase()}
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-sm text-gray-600">Last Updated</dt>
                      <dd className="font-medium mt-1">
                        {new Date(withdrawal.updated_at)?.toLocaleString()}
                      </dd>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {/* {withdrawal.notes && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-800 mb-2">
                      Withdrawal Notes
                    </h3>
                    <div className="text-sm text-blue-700 break-all">
                      {typeof notesObj === "object" && notesObj !== null ? (
                        <pre className="whitespace-pre-wrap break-all text-xs bg-blue-100 rounded p-2">
                          {JSON.stringify(notesObj, null, 2)}
                        </pre>
                      ) : (
                        <span>{withdrawal.notes}</span>
                      )}
                    </div>
                  </div>
                )} */}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Normal transaction UI
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
    <>
      <CustomBackbtn />
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
                      {String(
                        transaction.transaction_id || transaction.id || "",
                      ).toUpperCase()}
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
                      <dd className="font-mono text-sm px-2 py-1 rounded mt-1">
                        {String(
                          transaction.transaction_id || transaction.id || "",
                        )
                          .replace(/-/g, "")
                          .slice(0, 12)
                          .toUpperCase()}
                      </dd>
                    </div>
                    {transaction.order_id && (
                      <div>
                        <dt className="text-sm text-gray-600">Order ID</dt>
                        <dd className="font-mono text-sm bg-gray-100 px-2 py-1 rounded mt-1">
                          {(() => {
                            const digits = String(transaction.order_id ?? "")
                              .replace(/\D/g, "")
                              .slice(0, 12);
                            return (
                              digits ||
                              String(transaction.order_id ?? "")
                                .replace(/-/g, "")
                                .slice(0, 12) ||
                              transaction.order_id
                            );
                          })()}
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-sm text-gray-600">Payment Method</dt>
                      <dd className="font-medium capitalize mt-1">
                        {transaction.payment_method || "PAYSTACK"}
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
                          <dt className="text-sm text-gray-600">
                            Billing Cycle
                          </dt>
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

                      <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th
                                scope="col"
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Item
                              </th>
                              <th
                                scope="col"
                                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Qty
                              </th>
                              <th
                                scope="col"
                                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Price
                              </th>
                              <th
                                scope="col"
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Type
                              </th>
                              <th
                                scope="col"
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Vendor charges
                              </th>
                              <th
                                scope="col"
                                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Total
                              </th>
                            </tr>
                          </thead>

                          <tbody className="bg-white divide-y divide-gray-200">
                            {transaction.purchase.items.map((item) => {
                              const fabric =
                                item.vendor_charge?.fabric_vendor_fee ?? 0;
                              const designer =
                                item.vendor_charge?.fashion_designer_fee ?? 0;
                              const hasVendorCharges =
                                fabric > 0 || designer > 0;
                              const vendorText = hasVendorCharges
                                ? [
                                    fabric > 0 &&
                                      `Fabric: ${transaction.currency}${fabric.toFixed(
                                        2,
                                      )}`,
                                    designer > 0 &&
                                      `Designer: ${transaction.currency}${designer.toFixed(
                                        2,
                                      )}`,
                                  ]
                                    .filter(Boolean)
                                    .join(" • ")
                                : "—";

                              return (
                                <tr key={item.id} className="group">
                                  <td className="px-4 py-3 align-top">
                                    <div className="flex items-start gap-3 min-w-0">
                                      <div className="w-14 h-14 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                        <img
                                          src={
                                            item.thumbnail_url ||
                                            `https://via.placeholder.com/64x64/6366f1/ffffff?text=${encodeURIComponent(
                                              item.name.substring(0, 1),
                                            )}`
                                          }
                                          alt={item.name}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <div className="min-w-0">
                                        <div className="text-sm font-medium text-gray-900 truncate">
                                          {item.name}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1 truncate">
                                          Created:{" "}
                                          {new Date(
                                            item.created_at,
                                          ).toLocaleDateString()}
                                        </div>
                                      </div>
                                    </div>
                                  </td>

                                  <td className="px-4 py-3 align-top text-right whitespace-nowrap text-sm text-gray-700">
                                    {item.quantity}
                                  </td>

                                  <td className="px-4 py-3 align-top text-right whitespace-nowrap text-sm text-gray-700">
                                    {transaction.currency}{" "}
                                    {item.price.toFixed(2)}
                                  </td>

                                  <td className="px-4 py-3 align-top text-sm text-gray-700">
                                    <span className="capitalize">
                                      {item.purchase_type}
                                    </span>
                                  </td>

                                  <td className="px-4 py-3 align-top text-sm text-gray-500">
                                    <div className="text-sm">{vendorText}</div>
                                  </td>

                                  <td className="px-4 py-3 align-top text-right whitespace-nowrap font-medium text-gray-900">
                                    {transaction.currency}{" "}
                                    {(item.price * item.quantity).toFixed(2)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
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
    </>
  );
}
