import { useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import CaryBinApi from "../services/CarybinBaseUrl";
import {
  CalendarDays,
  User,
  Mail,
  Hash,
  AlertCircle,
  CheckCircle2,
  Clock,
  Phone,
  Shield,
  MapPin,
} from "lucide-react";
import { FaMoneyBill, FaCopy, FaCheck } from "react-icons/fa";
import CustomBackbtn from "./CustomBackBtn";
import { useState } from "react";

interface PaymentUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  alternative_phone?: string;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  is_suspended: boolean;
  referral_source?: string;
  created_at: string;
  updated_at: string;
}

interface PaymentDetail {
  user: PaymentUser;
  subscription_plan?: any;
  billing_info?: any;
  refunds?: any[];
  payment_gateway_logs?: any[];
}

interface PaymentResponse {
  statusCode: number;
  message: string;
  data: PaymentDetail;
}

const getVerificationStyle = (isVerified: boolean) => {
  return isVerified
    ? "bg-emerald-500/20 text-emerald-600 border-emerald-500/30"
    : "bg-rose-500/20 text-rose-600 border-rose-500/30";
};

export default function ViewTransactionDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  // Parse query params from location.search
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get("type") || "payment";
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Use the correct endpoint based on type
  const { data, isLoading, error } = useQuery<PaymentResponse>({
    queryKey: [type === "withdrawal" ? "withdraw" : "payment", id],
    queryFn: async () => {
      if (type === "withdrawal") {
        const resp = await CaryBinApi.get("/withdraw/details/" + id);
        return resp.data;
      } else {
        const resp = await CaryBinApi.get("/payment/my-payments/" + id);
        return resp.data;
      }
    },
  });

  // Copy to clipboard function
  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-purple-600 font-medium">
            Loading payment details...
          </p>
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
                Error loading payment details.
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const payment = data?.data;
  console.log(payment);
  if (!payment || !payment.user) {
    return null;
  }

  const user = payment.user;

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
              Payment Details
            </h1>
            <p className="text-gray-600">
              {data?.message || "Complete payment information"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-xl text-gray-900 border border-gray-200 transform transition-transform">
            <div className="flex items-center justify-between mb-4">
              <User className="w-10 h-10 text-gray-400" />
              <span className="text-xs font-medium bg-gray-100 px-3 py-1 rounded-full text-gray-600">
                Customer
              </span>
            </div>
            <div className="text-2xl font-bold mb-1">{user.name}</div>
            <div className="text-gray-500 text-sm truncate">{user.email}</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-purple-100 transform transition-transform">
            <div className="flex items-center justify-between mb-4">
              <Shield className="w-10 h-10 text-purple-600" />
              <span className="text-xs font-medium text-gray-500">
                Account Status
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${
                  user.is_suspended
                    ? "bg-rose-500/20 text-rose-600 border-rose-500/30"
                    : "bg-emerald-500/20 text-emerald-600 border-emerald-500/30"
                }`}
              >
                {user.is_suspended ? "Suspended" : "Active"}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl text-gray-900 border border-gray-200 transform transition-transform">
            <div className="flex items-center justify-between mb-4">
              <Phone className="w-10 h-10 text-gray-400" />
              <span className="text-xs font-medium bg-gray-100 px-3 py-1 rounded-full text-gray-600">
                Contact
              </span>
            </div>
            <div className="text-lg font-bold mb-1">{user.phone}</div>
            <div className="text-gray-500 text-xs">
              {user.alternative_phone || "No alt phone"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                User Information
              </h2>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Hash className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-semibold text-gray-700">
                        User ID
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(user.id?.replace(/-/g, "").slice(0, 12).toUpperCase(), "user_id")}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {copiedField === "user_id" ? (
                        <FaCheck className="w-4 h-4 text-green-500" />
                      ) : (
                        <FaCopy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="font-mono text-sm text-gray-900 bg-white px-4 py-2 rounded-lg border border-gray-200">
                    {user.id?.replace(/-/g, "").slice(0, 12)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-semibold text-gray-700">
                          Email
                        </span>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getVerificationStyle(user.is_email_verified)}`}
                      >
                        {user.is_email_verified ? "Verified" : "Not Verified"}
                      </span>
                    </div>
                    <div className="text-sm text-gray-900 break-all">
                      {user.email}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-semibold text-gray-700">
                          Phone
                        </span>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getVerificationStyle(user.is_phone_verified)}`}
                      >
                        {user.is_phone_verified ? "Verified" : "Not Verified"}
                      </span>
                    </div>
                    <div className="text-sm text-gray-900">{user.phone}</div>
                  </div>
                </div>

                {user.referral_source && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-700">
                        Referral Source
                      </span>
                    </div>
                    <div className="text-sm text-blue-900 capitalize">
                      {user.referral_source}
                    </div>
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
                Account Timeline
              </h3>

              <div className="space-y-4">
                <div className="relative pl-8 pb-6 border-l-2 border-cyan-200">
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-cyan-500 rounded-full border-4 border-white"></div>
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-4 border border-cyan-100">
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarDays className="w-4 h-4 text-cyan-600" />
                      <span className="font-bold text-cyan-700 text-sm">
                        Account Created
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 font-medium">
                      {formatDate(user.created_at).date}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(user.created_at).time}
                    </div>
                  </div>
                </div>

                <div className="relative pl-8">
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white"></div>
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 border border-emerald-100">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-emerald-700 text-sm">
                        Last Updated
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 font-medium">
                      {formatDate(user.updated_at).date}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(user.updated_at).time}
                    </div>
                  </div>
                </div>
              </div>

              {(payment.subscription_plan || payment.billing_info) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Payment Details
                  </h4>

                  {payment.subscription_plan && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-3">
                      <span className="text-sm font-semibold text-blue-700">
                        Subscription Plan
                      </span>
                      <div className="text-xs text-blue-600 mt-1">
                        {JSON.stringify(payment.subscription_plan)}
                      </div>
                    </div>
                  )}

                  {payment.billing_info && (
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <span className="text-sm font-semibold text-green-700">
                        Billing Info
                      </span>
                      <div className="text-xs text-green-600 mt-1">
                        {JSON.stringify(payment.billing_info)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {payment.refunds && payment.refunds.length > 0 && (
          <div className="mt-6 bg-amber-50 border-l-4 border-amber-500 p-6 rounded-lg shadow-lg">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-amber-800 text-lg mb-1">
                  Refunds Available
                </h3>
                <p className="text-amber-700 text-sm">
                  This payment has {payment.refunds.length} refund(s) associated
                  with it.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
