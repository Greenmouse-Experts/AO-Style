import { useState, useEffect } from "react";
import { Search, Check, Bell, Filter } from "lucide-react";
import { Link } from "react-router-dom";

import useQueryParams from "../../../hooks/useQueryParams";
import useGetNotification from "../../../hooks/notification/useGetNotification";
import Loader from "../../../components/ui/Loader";
import useDebounce from "../../../hooks/useDebounce";
import useUpdatedEffect from "../../../hooks/useUpdatedEffect";
import { formatDateStr } from "../../../lib/helper";
import useMarkReadNotification from "../../../hooks/notification/useMarkReadNotification";
import { toast } from "react-toastify";
import CaryBinApi from "../../../services/CarybinBaseUrl";

export default function NotificationPageUpdate() {
  const [filter, setFilter] = useState("all");

  const { queryParams, updateQueryParams } = useQueryParams({
    "pagination[limit]": 10,
    "pagination[page]": 1,
  });

  const { data, isPending } = useGetNotification({
    ...queryParams,
  });

  const { isPending: markReadIsPending } = useMarkReadNotification();

  const [queryString, setQueryString] = useState(queryParams.q);

  // Local state to track read status for notifications
  const [localNotifications, setLocalNotifications] = useState<
    any[] | undefined
  >(undefined);

  // Sync localNotifications with fetched data
  useEffect(() => {
    if (data?.data) {
      setLocalNotifications(data.data);
    }
  }, [data?.data]);

  const debouncedSearchTerm = useDebounce(queryString ?? "", 1000);

  useUpdatedEffect(() => {
    updateQueryParams({
      q: debouncedSearchTerm.trim() || undefined,
      "pagination[page]": 1,
    });
  }, [debouncedSearchTerm]);

  const totalPages = Math.ceil(
    (data?.count ?? 0) / (queryParams["pagination[limit]"] ?? 10),
  );

  const filterButtons = [
    { key: "all", label: "All Notifications", params: { read: undefined } },
    { key: "read", label: "Read", params: { read: true } },
    { key: "unread", label: "Unread", params: { read: false } },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Notifications
          </h1>
          <nav className="text-sm text-gray-500">
            <Link
              to="/admin"
              className="text-purple-600 hover:text-purple-800 transition-colors duration-200"
            >
              Dashboard
            </Link>
            <span className="mx-2">•</span>
            <span>Notifications</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1 bg-gray-100 rounded-lg p-1">
              {filterButtons.map((button) => (
                <button
                  key={button.key}
                  onClick={() => {
                    setFilter(button.key);
                    updateQueryParams({
                      ...button.params,
                      "pagination[page]": 1,
                    });
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    filter === button.key
                      ? "bg-white text-purple-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {button.label}
                  {filter === button.key && data?.count ? (
                    <span className="ml-2 bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full text-xs">
                      {data.count}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>

            {/* Search and Actions */}
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 w-64"
                  value={queryString ?? ""}
                  onChange={(evt) =>
                    setQueryString(evt.target.value ? evt.target.value : "")
                  }
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200">
                <Filter size={16} />
                Export As ▼
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {isPending ? (
            <div className="flex items-center justify-center py-20">
              <Loader />
            </div>
          ) : (
            <>
              {localNotifications?.length ? (
                <div className="divide-y divide-gray-100">
                  {localNotifications.map((notification, idx) => (
                    <div
                      key={notification?.id}
                      className={`relative p-6 transition-all duration-200 hover:bg-gray-50 ${
                        !notification?.read
                          ? "bg-purple-50 border-l-4 border-l-purple-500"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Notification Icon */}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3
                                className={`text-sm font-semibold ${
                                  !notification?.read
                                    ? "text-gray-900"
                                    : "text-gray-700"
                                }`}
                              >
                                {notification.title}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-3 mt-3">
                                <time className="text-xs text-gray-500">
                                  {notification?.created_at
                                    ? formatDateStr(
                                        notification?.created_at
                                          .split(".")
                                          .shift(),
                                        "relative",
                                      )
                                    : ""}
                                </time>
                                {!notification.read && (
                                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                                    New
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Action Button */}
                            <div className="flex items-center gap-2">
                              {!notification.read ? (
                                <button
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                                  onClick={async () => {
                                    if (!notification.read) {
                                      await toast.promise(
                                        async () => {
                                          await CaryBinApi.patch(
                                            "/notification-track/mark-read/" +
                                              notification.id,
                                          );
                                          // Update local state to mark as read
                                          setLocalNotifications((prev) =>
                                            prev
                                              ? prev.map((notif, i) =>
                                                  i === idx
                                                    ? { ...notif, read: true }
                                                    : notif,
                                                )
                                              : prev,
                                          );
                                        },
                                        {
                                          pending: "reading",
                                          success: "patched",
                                        },
                                      );
                                    }
                                  }}
                                  disabled={
                                    notification.read || markReadIsPending
                                  }
                                  title={
                                    notification.read
                                      ? "Marked as Read"
                                      : "Mark as Read"
                                  }
                                >
                                  <Check size={14} />
                                  Mark as read
                                </button>
                              ) : (
                                <div className="inline-flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-lg">
                                  <Check size={14} />
                                  Read
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No notifications found
                  </h3>
                  <p className="text-gray-500">
                    {filter === "all"
                      ? "You don't have any notifications yet."
                      : `No ${filter} notifications found.`}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          {localNotifications?.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Items per page:</span>
                  <select
                    value={queryParams["pagination[limit]"] || 10}
                    onChange={(e) =>
                      updateQueryParams({
                        "pagination[limit]": Number(e.target.value),
                        "pagination[page]": 1,
                      })
                    }
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Page {queryParams["pagination[page]"] || 1} of {totalPages}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        updateQueryParams({
                          "pagination[page]":
                            Number(queryParams["pagination[page]"]) - 1,
                        });
                      }}
                      disabled={
                        Number(queryParams["pagination[page]"] ?? 1) === 1
                      }
                      className="p-2 rounded-md bg-white border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => {
                        updateQueryParams({
                          "pagination[page]":
                            Number(queryParams["pagination[page]"]) + 1,
                        });
                      }}
                      disabled={
                        Number(queryParams["pagination[page]"] ?? 1) ===
                        totalPages
                      }
                      className="p-2 rounded-md bg-white border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
