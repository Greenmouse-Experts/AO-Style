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
} from "lucide-react";

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
      const resp = await CaryBinApi.get("/withdraw/" + id);
      return resp.data;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[300px]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="alert alert-error shadow-lg">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current flex-shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0-2l-2 2m0 2l2 2m2-2l-2-2m2-2l-2-2m2-2l-2-2m2-2l-2-2m2-2l-2-2m2-2l-2-2m2-2l-2-2m2-2l-2-2m2-2l-2-2"
              ></path>
            </svg>
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
    <div className="container mx-auto p-4" data-theme="nord">
      <div className="card bg-base-100">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold mb-4">
            Transaction Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div className="flex items-center">
              <ReceiptText className="w-5 h-5 mr-2 text-primary" />
              <span className="font-semibold">Transaction ID:</span>
              <span className="ml-2">{transaction.id}</span>
            </div>
            <div className="flex items-center">
              <User className="w-5 h-5 mr-2 text-primary" />
              <span className="font-semibold">User Name:</span>
              <span className="ml-2">{transaction.user_name}</span>
            </div>
            <div className="flex items-center">
              <User className="w-5 h-5 mr-2 text-primary" />
              <span className="font-semibold">User Email:</span>
              <span className="ml-2">{transaction.user_email}</span>
            </div>
            <div className="flex items-center">
              <User className="w-5 h-5 mr-2 text-primary" />
              <span className="font-semibold">User ID:</span>
              <span className="ml-2">{transaction.user_id}</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-primary" />
              <span className="font-semibold">Amount:</span>
              <span className="ml-2">
                {transaction.amount} {transaction.currency}
              </span>
            </div>
            <div className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-primary" />
              <span className="font-semibold">Status:</span>
              <span
                className={`ml-2 badge ${getStatusBadgeClass(transaction.status)}`}
              >
                {transaction.status}
              </span>
            </div>
            {transaction.notes && (
              <div className="flex items-center md:col-span-2">
                <ReceiptText className="w-5 h-5 mr-2 text-primary" />
                <span className="font-semibold">Notes:</span>
                <span className="ml-2">{transaction.notes}</span>
              </div>
            )}
            <div className="flex items-center">
              <CalendarDays className="w-5 h-5 mr-2 text-primary" />
              <span className="font-semibold">Created At:</span>
              <span className="ml-2">
                {new Date(transaction.created_at).toLocaleString()}
              </span>
            </div>
            {transaction.processed_by && (
              <div className="flex items-center">
                <User className="w-5 h-5 mr-2 text-primary" />
                <span className="font-semibold">Processed By:</span>
                <span className="ml-2">{transaction.processed_by}</span>
              </div>
            )}
            {transaction.processed_at && (
              <div className="flex items-center">
                <Timer className="w-5 h-5 mr-2 text-primary" />
                <span className="font-semibold">Processed At:</span>
                <span className="ml-2">
                  {new Date(transaction.processed_at).toLocaleString()}
                </span>
              </div>
            )}
            {transaction.deleted_at && (
              <div className="flex items-center text-red-500">
                <Timer className="w-5 h-5 mr-2" />
                <span className="font-semibold">Deleted At:</span>
                <span className="ml-2">
                  {new Date(transaction.deleted_at).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
