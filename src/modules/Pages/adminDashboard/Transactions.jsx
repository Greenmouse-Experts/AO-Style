import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import ReusableTable from "./components/ReusableTable";
import RegisterChart from "./components/RegisterChart";
import SalesSummaryChart from "./components/SalesSummaryChart";
import { FaEllipsisH } from "react-icons/fa";
import { AiOutlineSearch } from "react-icons/ai";
import { BsFilter } from "react-icons/bs";

import useQueryParams from "../../../hooks/useQueryParams";
// import useFetchAllCartTransactions from "../../../hooks/admin/useFetchAllCartTransactions";

import { formatDateStr } from "../../../lib/helper";
import useFetchAllWithdrawals from "../../../hooks/withdrawal/useFetchAllWithdrawals";
import useInitiateTransfer from "../../../hooks/withdrawal/useInitiateTransfer";
import useFinalizeTransfer from "../../../hooks/withdrawal/useFinalizeTransfer";
import useVerifyTransfer from "../../../hooks/withdrawal/useVerifyTransfer";
import AnalyticsCards from "./components/TransactionPayment";
import { Link, useNavigate } from "react-router-dom";
import SalesRevenueChart from "./components/RegisterChart";
import { useQuery } from "@tanstack/react-query";
import CaryBinApi from "../../../services/CarybinBaseUrl";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { CSVLink } from "react-csv";
import CustomTable from "../../../components/CustomTable";
import TransferOperationsModal from "./components/TransferOperationsModal";
import { toast } from "react-toastify";
const PaymentTransactionTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [_currentPage, setCurrentPage] = useState(1);
  const [_itemsPerPage, _setItemsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState("All Transactions");
  const [payoutSubTab, setPayoutSubTab] = useState("All");
  const [_selectAll, setSelectAll] = useState(false);
  const [_selectedRows, setSelectedRows] = useState(new Set());
  const dropdownRef = useRef(null);
  const [openDropdown, setOpenDropdown] = useState(null);

  // Transfer modal state
  const [transferModal, setTransferModal] = useState({
    isOpen: false,
    operation: null,
    withdrawal: null,
  });

  // Transfer hooks
  const { initiateTransfer, isPending: isInitiating } = useInitiateTransfer();
  const { verifyTransfer, isPending: isVerifying } = useVerifyTransfer();

  // Finalize transfer with auto-verify callback
  const handleAutoVerify = (finalizeResponse) => {
    console.log(
      "🔄 Auto-triggering verify with finalize response:",
      finalizeResponse,
    );

    // Extract reference from finalize response - try multiple possible locations (robust)
    let reference = null;

    // Helper to extract reference from known possible shapes
    const extractReference = (resp) => {
      if (!resp) return null;

      // Candidate fields in order of likelihood / known shapes
      const candidates = [
        resp.transfer_reference,
        resp.reference,
        resp.transfer_code,
        resp.data?.transfer_reference,
        resp.data?.reference,
        resp.data?.transfer_code,
        resp.data?.data?.transfer_reference,
        resp.data?.data?.reference,
        resp.data?.data?.transfer_code,
      ];

      for (const c of candidates) {
        if (c) return c;
      }

      // Try parsing notes if present (some APIs embed reference in notes JSON)
      if (resp.notes) {
        try {
          const notesData =
            typeof resp.notes === "string"
              ? JSON.parse(resp.notes)
              : resp.notes;
          return (
            notesData?.reference ||
            notesData?.transfer_code ||
            notesData?.transfer_reference ||
            null
          );
        } catch (e) {
          console.warn("Could not parse notes field:", e);
        }
      }

      return null;
    };

    reference = extractReference(finalizeResponse);

    if (reference) {
      console.log("🔍 Auto-verifying with reference:", reference);
      // Ensure reference is string when calling verify
      verifyTransfer({ reference: String(reference) });
    } else {
      console.error(
        "❌ No reference found in finalize response for auto-verify",
        finalizeResponse,
      );
      toast.error("Could not auto-verify: missing reference in response");
    }
  };

  const { finalizeTransfer, isPending: isFinalizing } =
    useFinalizeTransfer(handleAutoVerify);

  const { queryParams, updateQueryParams } = useQueryParams({
    status: "",
    "pagination[limit]": 10,
    "pagination[page]": 1,
  });

  // Remove queryString and debouncedSearchTerm, use searchTerm directly for filtering
  // const [queryString, setQueryString] = useState(queryParams.q);
  // const debouncedSearchTerm = useDebounce(queryString ?? "", 1000);

  // const { data: getAllTransactionData, isPending } =
  //   useFetchAllCartTransactions({
  //     ...queryParams,
  //   });
  const handleExport = (e) => {
    const value = e.target.value;
    if (value === "excel") exportToExcel();
    if (value === "pdf") exportToPDF();
    if (value === "csv") document.getElementById("csvDownload").click();
  };

  const exportToExcel = () => {
    const data = activeTab === "Payouts" ? withdrawalData?.data : [];
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "MyProducts.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    if (activeTab === "Payouts") {
      autoTable(doc, {
        head: [
          [
            "Withdrawal ID",
            "User Name",
            "Amount",
            "Status",
            "Bank Name",
            "Account Number",
            "Date",
          ],
        ],
        body:
          withdrawalData?.data?.map((withdrawal) => [
            `WTH${withdrawal.id}`,
            withdrawal.user?.name || withdrawal.user?.email,
            withdrawal.amount,
            withdrawal.status,
            withdrawal.bank_name,
            withdrawal.account_number,
            formatDateStr(withdrawal.created_at),
          ]) || [],
        headStyles: {
          fillColor: [209, 213, 219],
          textColor: [0, 0, 0],
          halign: "center",
          valign: "middle",
          fontSize: 8,
        },
        styles: {
          fontSize: 7,
          cellPadding: 2,
        },
        theme: "grid",
        startY: 10,
      });
    }

    doc.save("WithdrawalRequests.pdf");
  };

  // Fetch all data without search param, filter on client
  const { data: getAllTransactionData, isPending: isPending } = useQuery({
    queryKey: ["transactions_admin"],
    queryFn: async () => {
      let resp = await CaryBinApi.get("/payment/fetch-all", {
        params: {
          // No q param, fetch all
        },
      });
      return resp.data;
    },
  });

  // Fetch withdrawal data for payouts tab using fetch-all endpoint
  const { data: withdrawalData, isPending: isWithdrawalPending } =
    useFetchAllWithdrawals({
      // No q param, fetch all
    });

  const tabs = ["All Transactions", "Income", "Payouts"];
  const nav = useNavigate();

  // Handle transfer operations
  const openTransferModal = useCallback((operation, withdrawal) => {
    setTransferModal({
      isOpen: true,
      operation,
      withdrawal,
    });
  }, []);

  const columns = useMemo(
    () => [
      {
        label: "Transaction ID",
        key: "transactionID",
        className: "text-gray-500 font-medium text-sm py-4",
      },
      {
        label: "Date and Time",
        key: "date",
        className: "text-gray-500 font-medium text-sm py-4",
      },
      {
        label: "User Name",
        key: "userName",
        className: "text-gray-500 font-medium text-sm py-4",
      },
      {
        label: "User Type",
        key: "userType",
        className: "text-gray-500 font-medium text-sm py-4",
      },
      {
        label: "Amount",
        key: "amount",
        className: "text-gray-500 font-medium text-sm py-4",
        render: (value, item) => (
          <span className="font-semibold text-gray-900">
            ₦{item.rawAmount?.toLocaleString() || value}
          </span>
        ),
      },
      {
        label: "Transaction Type",
        key: "transactionType",
        className: "text-gray-500 font-medium text-sm py-4",
      },
      {
        label: "Status",
        key: "status",
        className: "text-gray-500 font-medium text-sm py-4",
        render: (status) => (
          <span
            className={`px-2 py-1 text-sm rounded-full font-medium ${
              status === "In-Progress" || status === "PENDING"
                ? "bg-blue-100 text-blue-500"
                : status === "ACCEPTED" || status === "Completed"
                  ? "bg-green-100 text-green-500"
                  : status === "DECLINED"
                    ? "bg-red-100 text-red-500"
                    : "bg-gray-100 text-gray-500"
            }`}
          >
            {status}
          </span>
        ),
      },
      {
        key: "action",
        label: "Action",
        render: (value, item) => (
          <div className="flex space-x-2">
            <button
              onClick={() => {
                // If in Payouts tab, go to withdrawal details, else transaction details
                if (activeTab === "Payouts") {
                  // Go to withdrawal details page, pass withdrawal id
                  nav("/admin/transactions/" + item.id, {
                    viewTransition: true,
                  });
                } else {
                  nav("/admin/transactions/" + item.id, {
                    viewTransition: true,
                  });
                }
              }}
              className="cursor-pointer text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View Details
            </button>
            {!item.isInitiated && item.status === "PENDING" && (
              <button
                onClick={() => openTransferModal("initiate", item)}
                className="cursor-pointer text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Initiate Transfer
              </button>
            )}
            {item.isInitiated && (
              <button
                onClick={() => openTransferModal("finalize", item)}
                className="cursor-pointer text-green-600 hover:text-green-800 text-sm font-medium"
              >
                Finalize & Verify
              </button>
            )}
          </div>
        ),
      },
    ],
    [nav, openTransferModal, activeTab],
  );

  const _toggleDropdown = (rowId) => {
    setOpenDropdown(openDropdown === rowId ? null : rowId);
  };

  // Format withdrawal data for payouts using fetch-all endpoint structure
  const WithdrawalData = useMemo(() => {
    if (!withdrawalData?.data) return [];

    let filteredData = withdrawalData.data;

    // Filter based on sub-tab selection
    if (payoutSubTab === "Initiated") {
      // Filter withdrawals that have notes (indicating they've been initiated)
      filteredData = withdrawalData.data.filter(
        (withdrawal) => withdrawal.notes && withdrawal.notes.trim() !== "",
      );
    }

    // Filter by search term
    if (searchTerm && searchTerm.trim() !== "") {
      const lower = searchTerm.trim().toLowerCase();
      filteredData = filteredData.filter((withdrawal) => {
        // Check relevant fields for search
        return (
          withdrawal?.id
            .replace(/-/g, "")
            .slice(0, 12)
            .toLowerCase()
            .includes(lower) ||
          (withdrawal?.user?.name &&
            withdrawal.user.name.toLowerCase().includes(lower)) ||
          (withdrawal?.user?.email &&
            withdrawal.user.email.toLowerCase().includes(lower)) ||
          (withdrawal?.bank_name &&
            withdrawal.bank_name.toLowerCase().includes(lower)) ||
          (withdrawal?.account_number &&
            withdrawal.account_number.toLowerCase().includes(lower)) ||
          (withdrawal?.account_name &&
            withdrawal.account_name.toLowerCase().includes(lower)) ||
          (withdrawal?.status &&
            withdrawal.status.toLowerCase().includes(lower)) ||
          (withdrawal?.amount &&
            withdrawal.amount.toString().toLowerCase().includes(lower))
        );
      });
    }

    return filteredData.map((withdrawal) => {
      return {
        ...withdrawal,
        transactionID: withdrawal?.id
          ?.replace(/-/g, "")
          ?.slice(0, 12)
          .toUpperCase(),
        userName: withdrawal?.user?.name || withdrawal?.user?.email,
        amount: withdrawal?.amount?.toLocaleString() || withdrawal?.amount,
        rawAmount: withdrawal?.amount,
        status: withdrawal?.status || "PENDING",
        transactionType: "Withdrawal",
        userType:
          withdrawal?.user?.role?.name || withdrawal?.user?.role || "Unknown",
        date: withdrawal?.created_at
          ? formatDateStr(
              withdrawal.created_at.split(".").shift(),
              "DD MMM YYYY",
            )
          : "",
        isInitiated: withdrawal.notes && withdrawal.notes.trim() !== "",
        id: withdrawal?.id,
      };
    });
  }, [withdrawalData?.data, payoutSubTab, searchTerm]);

  // TransactionData: filter by searchTerm and tab
  const TransactionData = useMemo(() => {
    let arr =
      getAllTransactionData?.data && Array.isArray(getAllTransactionData.data)
        ? getAllTransactionData.data.map((details) => {
            // Fix: always show only first 12 chars of transaction_id/id, no hyphens
            let txIdRaw = details?.transaction_id ?? details?.id ?? "";
            let txIdFormatted =
              typeof txIdRaw === "string"
                ? txIdRaw.replace(/-/g, "").slice(0, 12).toUpperCase()
                : "";
            return {
              ...details,
              transactionID: txIdFormatted,
              userName: `${details?.user?.email ?? "ss"}`,
              amount: details?.amount,
              rawAmount: details?.amount,
              location: `${details?.profile?.address ?? ""}`,
              status: details?.payment_status ?? "",
              transactionType:
                details?.transaction_type || details?.purchase_type || "",
              userType: details?.subscription_plan?.role ?? "customer",
              date: `${
                details?.created_at
                  ? formatDateStr(
                      details?.created_at.split(".").shift(),
                      "DD MMM YYYY",
                    )
                  : ""
              }`,
              id: details?.id,
            };
          })
        : [];

    // Filter by search term
    if (searchTerm && searchTerm.trim() !== "") {
      const lower = searchTerm.trim().toLowerCase();
      arr = arr.filter((item) =>
        Object.values(item).some(
          (val) => typeof val === "string" && val.toLowerCase().includes(lower),
        ),
      );
    }

    // For All Transactions: show both income and payouts (withdrawals)
    // For Income: show only "income" (payments), i.e. anything that is NOT a payout/withdrawal
    // For Payouts: handled separately

    if (activeTab === "Income") {
      // Only show transactions that are NOT withdrawals
      arr = arr.filter(
        (transaction) =>
          transaction.transactionType &&
          transaction.transactionType.toLowerCase() !== "withdrawal",
      );
    }

    // For All Transactions, combine both payments and withdrawals
    if (activeTab === "All Transactions") {
      // Combine payment transactions and withdrawal transactions
      // WithdrawalData is already formatted
      return [...arr, ...WithdrawalData];
    }

    // For Payouts, handled in WithdrawalData
    return arr;
  }, [getAllTransactionData?.data, searchTerm, activeTab, WithdrawalData]);

  // Debug withdrawal data
  useEffect(() => {
    if (activeTab === "Payouts") {
      console.log("💸 Withdrawal Data:", withdrawalData);
      console.log("💰 Formatted Withdrawal Data:", WithdrawalData);
      console.log("🎯 Payout Sub Tab:", payoutSubTab);
    }
  }, [withdrawalData, WithdrawalData, payoutSubTab, activeTab]);

  // const indexOfLastItem = currentPage * itemsPerPage;
  // const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(
    getAllTransactionData?.count / (queryParams["pagination[limit]"] ?? 10),
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const csv_data =
    activeTab === "Payouts"
      ? withdrawalData?.data?.map((withdrawal) => ({
          TransactionID: withdrawal.id
            .replace(/-/g, "")
            .slice(0, 12)
            .toUpperCase(),
          UserName: withdrawal.user?.name || withdrawal.user?.email,
          UserType:
            withdrawal.user?.role?.name || withdrawal.user?.role || "Unknown",
          Amount: withdrawal.amount,
          Status: withdrawal.status || "PENDING",
          IsInitiated:
            withdrawal.notes && withdrawal.notes.trim() !== "" ? "Yes" : "No",
          Notes: withdrawal.notes || "",
          BankName: withdrawal.bank_name,
          AccountNumber: withdrawal.account_number,
          AccountName: withdrawal.account_name,
          CreatedAt: withdrawal.created_at,
          UpdatedAt: withdrawal.updated_at,
          UserID: withdrawal.user?.id,
          UserEmail: withdrawal.user?.email,
          UserPhone: withdrawal.user?.phone,
        })) || []
      : getAllTransactionData?.data?.flatMap((transaction) => {
          const user = transaction.user || {};
          const profile = user.profile || {};
          const items = transaction.purchase?.items || [];

          // Fix: always show only first 12 chars of transaction_id/id, no hyphens
          let txIdRaw = transaction.transaction_id ?? transaction.id ?? "";
          let txIdFormatted =
            typeof txIdRaw === "string"
              ? txIdRaw.replace(/-/g, "").slice(0, 12).toUpperCase()
              : "";

          return items.map((item) => ({
            TransactionID: txIdFormatted,
            PaymentStatus: transaction.payment_status,
            PaymentMethod: transaction.payment_method,
            Amount: transaction.amount,
            Currency: transaction.currency,
            PurchaseType:
              transaction.transaction_type || transaction.purchase_type || "",
            ProductName: item.name,
            Quantity: item.quantity,
            ProductPrice: item.price,
            FabricVendorFee: item.vendor_charge?.fabric_vendor_fee ?? "",
            FashionDesignerFee: item.vendor_charge?.fashion_designer_fee ?? "",
            CreatedAt: transaction.created_at,
            UpdatedAt: transaction.updated_at,
            UserID: user.id,
            UserEmail: user.email,
            UserPhone: user.phone,
            Address: profile.address,
            State: profile.state,
            Country: profile.country,
          }));
        }) || [];

  const closeTransferModal = () => {
    setTransferModal({
      isOpen: false,
      operation: null,
      withdrawal: null,
    });
  };

  const handleTransferConfirm = (payload) => {
    const { operation } = transferModal;

    if (operation === "initiate") {
      initiateTransfer(payload, {
        onSuccess: () => closeTransferModal(),
      });
    } else if (operation === "finalize") {
      // Finalize will auto-trigger verify on success
      finalizeTransfer(payload, {
        onSuccess: () => closeTransferModal(),
      });
    } else if (operation === "verify") {
      verifyTransfer(payload, {
        onSuccess: () => closeTransferModal(),
      });
    }
  };

  const getTransferLoading = () => {
    const { operation } = transferModal;
    if (operation === "initiate") return isInitiating;
    if (operation === "finalize") return isFinalizing;
    if (operation === "verify") return isVerifying;
    return false;
  };

  const actions_col = [
    {
      action: (item) => {
        // If in Payouts tab, go to withdrawal details, else transaction details
        if (activeTab === "Payouts") {
          return nav("/admin/transactions/" + item.id, {
            viewTransition: true,
          });
        } else {
          return nav("/admin/transactions/" + item.id, {
            viewTransition: true,
          });
        }
      },
      key: "view_details",
      label: "View Details",
    },
  ];

  return (
    <>
      <AnalyticsCards />
      <div className="bg-white p-6 rounded-xl overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`text-sm font-medium ${
                  activeTab === tab
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                  setSelectAll(false);
                  setSelectedRows(new Set());
                }}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
            <div className="relative">
              <input
                type="text"
                placeholder="Search ..."
                value={searchTerm}
                onChange={(evt) => setSearchTerm(evt.target.value)}
                className="py-2 pl-10 pr-3 border border-gray-200 rounded-md outline-none text-sm w-full sm:w-64"
              />
              <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <button
              onClick={() => {
                console.log(getAllTransactionData?.data?.[0]);
              }}
              className="bg-gray-100 text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap flex items-center"
            >
              <BsFilter className="mr-1" /> Filter
            </button>
            <CSVLink
              id="csvDownload"
              data={csv_data}
              filename="MyProducts.csv"
              className="hidden"
            />{" "}
            <select
              onChange={handleExport}
              className="bg-gray-100 outline-none text-gray-700 px-3 py-2 text-sm rounded-md whitespace-nowrap"
            >
              <option value="" disabled selected>
                Export As
              </option>
              <option value="csv">Export to CSV</option>{" "}
              <option value="excel">Export to Excel</option>{" "}
              <option value="pdf">Export to PDF</option>{" "}
            </select>
          </div>
        </div>

        {/* Sub-tabs for Payouts */}
        {activeTab === "Payouts" && (
          <div className="flex space-x-4 mb-4 border-b border-gray-100">
            {["All", "Initiated"].map((subTab) => (
              <button
                key={subTab}
                className={`text-sm font-medium pb-2 px-1 ${
                  payoutSubTab === subTab
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => {
                  console.log("🎯 Switching to payout sub-tab:", subTab);
                  setPayoutSubTab(subTab);
                  setCurrentPage(1);
                }}
              >
                {subTab === "All" ? "All Payouts" : subTab}
              </button>
            ))}
          </div>
        )}

        <div className="flex border-b border-gray-200 mb-4"></div>
        <CustomTable
          columns={columns}
          data={activeTab === "Payouts" ? WithdrawalData : TransactionData}
          actions={activeTab === "Payouts" ? [] : actions_col}
          loading={activeTab === "Payouts" ? isWithdrawalPending : isPending}
        />
        {(activeTab === "Payouts" ? WithdrawalData : TransactionData)?.length >
        0 ? (
          <>
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center">
                <p className="text-sm text-gray-600">Items per page: </p>
                <select
                  value={queryParams["pagination[limit]"] || 10}
                  onChange={(e) =>
                    updateQueryParams({
                      "pagination[limit]": +e.target.value,
                    })
                  }
                  className="py-2 px-3 border border-gray-200 ml-2 rounded-md outline-none text-sm w-auto"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                </select>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    updateQueryParams({
                      "pagination[page]": +queryParams["pagination[page]"] - 1,
                    });
                  }}
                  disabled={(queryParams["pagination[page]"] ?? 1) == 1}
                  className="px-3 py-1 rounded-md bg-gray-200"
                >
                  ◀
                </button>
                <button
                  onClick={() => {
                    updateQueryParams({
                      "pagination[page]": +queryParams["pagination[page]"] + 1,
                    });
                  }}
                  disabled={
                    (queryParams["pagination[page]"] ?? 1) >=
                    (activeTab === "Payouts"
                      ? Math.ceil(
                          (withdrawalData?.total ||
                            withdrawalData?.data?.length ||
                            0) / (queryParams["pagination[limit]"] ?? 10),
                        )
                      : totalPages)
                  }
                  className="px-3 py-1 rounded-md bg-gray-200"
                >
                  ▶
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {activeTab === "Payouts" && isWithdrawalPending
                ? "Loading withdrawal data..."
                : activeTab === "Payouts"
                  ? "No withdrawal requests found"
                  : isPending
                    ? "Loading transactions..."
                    : "No transactions found"}
            </p>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 flex flex-col">
          <SalesRevenueChart />
        </div>
        <div className="lg:col-span-1">
          <SalesSummaryChart />
        </div>

        {/* Transfer Operations Modal */}
        <TransferOperationsModal
          isOpen={transferModal.isOpen}
          operation={transferModal.operation}
          withdrawal={transferModal.withdrawal}
          onClose={closeTransferModal}
          onConfirm={handleTransferConfirm}
          isLoading={getTransferLoading()}
        />
      </div>
    </>
  );
};

export default PaymentTransactionTable;
