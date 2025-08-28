import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import CaryBinApi from "../services/CarybinBaseUrl";
import {
  CalendarDays,
  Timer,
  ReceiptText,
  CreditCard,
  User,
  DollarSign,
  Mail,
  Hash,
  AlertCircle,
} from "lucide-react";
import { FaMoneyBill } from "react-icons/fa";

interface TransactionDetail {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  amount: string;
  currency: string;
  status:
    | "PENDING"
    | "FAILED"
    | "CANCELLED"
    | "PAID"
    | "PROCESSING"
    | "SHIPPED"
    | "IN_TRANSIT"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "RETURNED";
  notes: string | null;
  processed_by: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface TransactionResponse {
  statusCode: number;
  data: TransactionDetail;
}

const getStatusBadgeClass = (status: TransactionDetail["status"]): string => {
  switch (status) {
    case "PENDING":
      return "badge-warning";
    case "PAID":
    case "PROCESSING":
    case "SHIPPED":
    case "IN_TRANSIT":
    case "OUT_FOR_DELIVERY":
    case "DELIVERED":
      return "badge-success";
    case "FAILED":
    case "CANCELLED":
    case "RETURNED":
      return "badge-error";
    default:
      return "badge-neutral";
  }
};

export default function ViewTransactionDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useQuery<TransactionResponse>({
    queryKey: ["transaction", id],
    queryFn: async () => {
      const resp = await CaryBinApi.get("/withdraw/details/" + id);
      return resp.data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-200 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="alert alert-error">
            <AlertCircle className="w-6 h-6" />
            <span>Error loading transaction details.</span>
          </div>
        </div>
      </div>
    );
  }

  const transaction = data?.data;

  if (!transaction) {
    return null;
  }

  return (
    <div className="min-h-screen bg-transparent py-8 px-4" data-theme="nord">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-base-content mb-3">
            Transaction Details
          </h1>
          <p className="text-base-content/60 text-lg">
            View complete information for transaction {transaction.id}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Stats Cards */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            <div className="card bg-gradient-to-br from-primary/10 to-primary/20 border border-primary/20">
              <div className="card-body text-center py-6">
                <FaMoneyBill className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary">
                  {transaction.amount}
                </div>
                <div className="text-sm opacity-60">{transaction.currency}</div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-accent/10 to-accent/20 border border-accent/20">
              <div className="card-body text-center py-6">
                <CreditCard className="w-8 h-8 text-accent mx-auto mb-2" />
                <div
                  className={`badge badge-lg ${getStatusBadgeClass(transaction.status)} mb-1 mx-auto`}
                >
                  {transaction.status}
                </div>
                <div className="text-xs opacity-60">Current Status</div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-secondary/10 to-secondary/20 border border-secondary/20">
              <div className="card-body text-center py-6">
                <User className="w-8 h-8 text-secondary mx-auto mb-2" />
                <div className="text-sm font-semibold text-secondary truncate">
                  {transaction.user_name}
                </div>
                <div className="text-xs opacity-60">Customer</div>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-6 pb-4 border-b border-base-300">
                  <ReceiptText className="w-7 h-7 text-primary" />
                  Transaction Information
                </h2>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-base-200/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Hash className="w-5 h-5 text-primary" />
                        <span className="font-semibold text-base-content">
                          Transaction ID
                        </span>
                      </div>
                      <div className="font-mono text-sm bg-base-300 px-3 py-1 rounded-lg mt-2 sm:mt-0 break-all">
                        {transaction.id}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-base-200/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-accent" />
                        <span className="font-semibold text-base-content">
                          User ID
                        </span>
                      </div>
                      <div className="font-mono text-sm bg-base-300 px-3 py-1 rounded-lg mt-2 sm:mt-0">
                        {transaction.user_id}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-base-200/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-secondary" />
                        <span className="font-semibold text-base-content">
                          Email
                        </span>
                      </div>
                      <div className="text-base-content/80 mt-2 sm:mt-0">
                        {transaction.user_email}
                      </div>
                    </div>
                  </div>
                </div>

                {transaction.notes && (
                  <div className="mt-8 pt-6 border-t border-base-300">
                    <div className="flex items-center gap-3 mb-4">
                      <ReceiptText className="w-5 h-5 text-warning" />
                      <span className="font-semibold text-lg">Notes</span>
                    </div>
                    <div className="bg-warning/10 border-l-4 border-warning p-4 rounded-lg">
                      <p className="text-base-content/90">
                        {transaction.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timeline & Processing Info */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-xl h-fit">
              <div className="card-body">
                <h3 className="card-title text-xl mb-6 pb-4 border-b border-base-300">
                  <Timer className="w-6 h-6 text-info" />
                  Timeline
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-3 bg-info/10 rounded-lg">
                    <CalendarDays className="w-5 h-5 text-info mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-info mb-1">
                        Created
                      </div>
                      <div className="text-sm text-base-content/80">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-base-content/60">
                        {new Date(transaction.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  {transaction.processed_at && (
                    <div className="flex items-start gap-4 p-3 bg-success/10 rounded-lg">
                      <Timer className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-success mb-1">
                          Processed
                        </div>
                        <div className="text-sm text-base-content/80">
                          {new Date(
                            transaction.processed_at,
                          ).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-base-content/60">
                          {new Date(
                            transaction.processed_at,
                          ).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  )}

                  {transaction.processed_by && (
                    <div className="mt-6 pt-4 border-t border-base-300">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="w-4 h-4 text-neutral" />
                        <span className="text-sm font-semibold text-neutral">
                          Processed By
                        </span>
                      </div>
                      <div className="text-sm text-base-content/80 bg-base-200 px-3 py-2 rounded">
                        {transaction.processed_by}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {transaction.deleted_at && (
          <div className="alert alert-error mt-6">
            <AlertCircle className="w-6 h-6" />
            <div>
              <h3 className="font-bold">Deleted Transaction</h3>
              <div className="text-sm opacity-80">
                This transaction was deleted on{" "}
                {new Date(transaction.deleted_at).toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
