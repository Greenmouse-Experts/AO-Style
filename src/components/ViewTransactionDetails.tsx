import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import CaryBinApi from "../services/CarybinBaseUrl";
import {
  CalendarDays,
  Timer,
  User,
  Mail,
  Hash,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { FaMoneyBill } from "react-icons/fa";
import CustomBackbtn from "./CustomBackBtn";

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

const getStatusStyle = (status: TransactionDetail["status"]) => {
  switch (status) {
    case "PENDING":
      return "bg-amber-500/20 text-amber-600 border-amber-500/30";
    case "PAID":
    case "PROCESSING":
    case "SHIPPED":
    case "IN_TRANSIT":
    case "OUT_FOR_DELIVERY":
    case "DELIVERED":
      return "bg-emerald-500/20 text-emerald-600 border-emerald-500/30";
    case "FAILED":
    case "CANCELLED":
    case "RETURNED":
      return "bg-rose-500/20 text-rose-600 border-rose-500/30";
    default:
      return "bg-gray-500/20 text-gray-600 border-gray-500/30";
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
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-purple-600 font-medium">Loading transaction...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-rose-50 border-l-4 border-rose-500 p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-rose-500" />
              <span className="text-rose-800 font-medium">
                Error loading transaction details.
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const transaction = data?.data;

  if (!transaction) {
    return null;
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 rounded-sm">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <CustomBackbtn />
          <div className="mt-6 text-center">
            <h1 className="text-4xl font-bold bg-purple-600 bg-clip-text text-transparent mb-2">
              Transaction Details
            </h1>
            <p className="text-gray-600">
              Complete information for this transaction
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-xl text-gray-900 border border-gray-200 transform transition-transform">
            <div className="flex items-center justify-between mb-4">
              <FaMoneyBill className="w-10 h-10 text-gray-400" />
              <span className="text-xs font-medium bg-gray-100 px-3 py-1 rounded-full text-gray-600">
                Amount
              </span>
            </div>
            <div className="text-3xl font-bold mb-1">{transaction.amount}</div>
            <div className="text-gray-500 text-sm">{transaction.currency}</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-purple-100 transform transition-transform">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle2 className="w-10 h-10 text-purple-600" />
              <span className="text-xs font-medium text-gray-500">Status</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusStyle(transaction.status)}`}
              >
                {transaction.status}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl text-gray-900 border border-gray-200 transform transition-transform">
            <div className="flex items-center justify-between mb-4">
              <User className="w-10 h-10 text-gray-400" />
              <span className="text-xs font-medium bg-gray-100 px-3 py-1 rounded-full text-gray-600">
                Customer
              </span>
            </div>
            <div className="text-lg font-bold truncate mb-1">
              {transaction.user_name}
            </div>
            <div className="text-gray-500 text-xs truncate">
              {transaction.user_email}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Hash className="w-6 h-6 text-white" />
                </div>
                Transaction Information
              </h2>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
                  <div className="flex items-center gap-3 mb-2">
                    <Hash className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-semibold text-gray-700">
                      Transaction ID
                    </span>
                  </div>
                  <div className="font-mono text-sm text-gray-900 bg-white px-4 py-2 rounded-lg border border-gray-200">
                    {transaction.id}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-100">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-700">
                      User ID
                    </span>
                  </div>
                  <div className="font-mono text-sm text-gray-900 bg-white px-4 py-2 rounded-lg border border-gray-200">
                    {transaction.user_id}
                  </div>
                </div>

                {/*<div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-5 border border-violet-100">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="w-5 h-5 text-violet-600" />
                    <span className="text-sm font-semibold text-gray-700">
                      Email Address
                    </span>
                  </div>
                  <div className="text-gray-900 bg-white px-4 py-2 rounded-lg border border-gray-200 break-all">
                    {transaction.user_email}
                  </div>
                </div>*/}

                {transaction.notes && (
                  <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border-l-4 border-amber-400">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-bold text-gray-900">Notes</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {transaction.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 sticky top-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                Timeline
              </h3>

              <div className="space-y-4">
                <div className="relative pl-8 pb-6 border-l-2 border-cyan-200">
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-cyan-500 rounded-full border-4 border-white"></div>
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-4 border border-cyan-100">
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarDays className="w-4 h-4 text-cyan-600" />
                      <span className="font-bold text-cyan-700 text-sm">
                        Created
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 font-medium">
                      {formatDate(transaction.created_at).date}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(transaction.created_at).time}
                    </div>
                  </div>
                </div>

                {transaction.processed_at && (
                  <div className="relative pl-8">
                    <div className="absolute -left-2 top-0 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white"></div>
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 border border-emerald-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Timer className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-emerald-700 text-sm">
                          Processed
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 font-medium">
                        {formatDate(transaction.processed_at).date}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(transaction.processed_at).time}
                      </div>
                    </div>
                  </div>
                )}

                {transaction.processed_by && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-semibold text-gray-700">
                          Processed By
                        </span>
                      </div>
                      <div className="text-sm text-gray-900 font-medium">
                        {transaction.processed_by}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {transaction.deleted_at && (
          <div className="mt-6 bg-rose-50 border-l-4 border-rose-500 p-6 rounded-lg shadow-lg">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-rose-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-rose-800 text-lg mb-1">
                  Deleted Transaction
                </h3>
                <p className="text-rose-700 text-sm">
                  This transaction was deleted on{" "}
                  {new Date(transaction.deleted_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
