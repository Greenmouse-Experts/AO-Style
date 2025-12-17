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
import PaginationButton from "../../../components/PaginationButton";

export default function NotificationPageUpdate() {
  const [filter, setFilter] = useState("all");
  const [expandedNotifications, setExpandedNotifications] = useState<Set<number>>(new Set());

  const { queryParams, updateQueryParams } = useQueryParams({
    "pagination[limit]": 10,
    "pagination[page]": 1,
  });

  const { data, isPending, refetch } = useGetNotification({
    ...queryParams,
  });

  const { isPending: markReadIsPending, markReadNotificationMutate } =
    useMarkReadNotification();

  const [queryString, setQueryString] = useState(queryParams.q);

  const debouncedSearchTerm = useDebounce(queryString ?? "", 1000);

  useUpdatedEffect(() => {
    updateQueryParams({
      q: debouncedSearchTerm.trim() || undefined,
      "pagination[page]": 1,
    });
  }, [debouncedSearchTerm]);

  const totalPages = Math.ceil(
    (data?.count ?? 0) / (Number(queryParams["pagination[limit]"]) ?? 10),
  );

  const filterButtons = [
    { key: "all", label: "All Notifications", params: { read: undefined } },
    { key: "read", label: "Read", params: { read: true } },
    { key: "unread", label: "Unread", params: { read: false } },
  ];

  const toggleExpand = (notificationId: number) => {
    setExpandedNotifications((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  const isExpanded = (notificationId: number) => {
    return expandedNotifications.has(notificationId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 md:px-6 py-4 md:py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">
            Notifications
          </h1>
          <nav className="text-xs md:text-sm text-gray-500">
            <Link
              to={
                // Redirect to dashboard based on current route
                window.location.pathname.includes("tailor")
                  ? "/tailor"
                  : window.location.pathname.includes("fabric")
                    ? "/fabric"
                    : window.location.pathname.includes("customer")
                      ? "/customer"
                      : window.location.pathname.includes("logistics")
                        ? "/logistics"
                        : window.location.pathname.includes("admin")
                          ? "/admin"
                          : "/"
              }
              className="text-purple-600 hover:text-purple-800 transition-colors duration-200"
            >
              Dashboard
            </Link>
            <span className="mx-2">•</span>
            <span>Notifications</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-8">
        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 md:p-6 mb-4 md:mb-6">
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6 justify-between items-start lg:items-center">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1 bg-gray-100 rounded-lg p-1 w-full lg:w-auto overflow-x-auto">
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
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-md text-xs md:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    filter === button.key
                      ? "bg-white text-purple-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {button.label}
                  {filter === button.key && data?.count ? (
                    <span className="ml-1 md:ml-2 bg-purple-100 text-purple-600 px-1.5 md:px-2 py-0.5 rounded-full text-xs">
                      {data.count}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>

            {/* Search and Actions */}
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full lg:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search
                  className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  className="pl-8 md:pl-10 pr-3 md:pr-4 py-2 md:py-2.5 w-full sm:w-64 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm"
                  value={queryString ?? ""}
                  onChange={(evt) =>
                    setQueryString(evt.target.value ? evt.target.value : "")
                  }
                />
              </div>
              <button className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 text-xs md:text-sm whitespace-nowrap">
                <Filter size={14} className="md:w-4 md:h-4" />
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
              {data?.data?.length ? (
                <div className="divide-y divide-gray-100">
                  {data.data.map((notification: any, idx: number) => (
                    <div
                      key={notification?.id}
                      className={`relative p-3 md:p-6 transition-all duration-200 hover:bg-gray-50 cursor-pointer ${
                        !notification?.read
                          ? "bg-purple-50 border-l-4 border-l-purple-500"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => toggleExpand(notification?.id)}
                    >
                      <div className="flex flex-col sm:flex-row items-start gap-3 md:gap-4">
                        {/* Content */}
                        <div className="flex-1 min-w-0 w-full">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 md:gap-4">
                            <div className="flex-1 min-w-0">
                              <h3
                                className={`text-sm md:text-base font-semibold ${
                                  !notification?.read
                                    ? "text-gray-900"
                                    : "text-gray-700"
                                }`}
                              >
                                {notification.title}
                              </h3>
                              <p className={`text-xs md:text-sm text-gray-600 mt-1 break-words ${
                                isExpanded(notification?.id) ? "" : "line-clamp-2"
                              }`}>
                                {notification.message}
                              </p>
                              {notification.message && notification.message.length > 100 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpand(notification?.id);
                                  }}
                                  className="text-xs md:text-sm text-purple-600 hover:text-purple-700 font-medium mt-1"
                                >
                                  {isExpanded(notification?.id) ? "Show less" : "Show more"}
                                </button>
                              )}
                              <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2 md:mt-3">
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
                            <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                              {!notification.read ? (
                                <button
                                  className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 md:py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-xs md:text-sm font-medium rounded-lg transition-colors duration-200 whitespace-nowrap"
                                  onClick={() => {
                                    if (!notification.read) {
                                      markReadNotificationMutate(
                                        notification.id,
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
                                  <Check size={12} className="md:w-3.5 md:h-3.5" />
                                  <span className="hidden sm:inline">Mark as read</span>
                                  <span className="sm:hidden">Read</span>
                                </button>
                              ) : (
                                <div className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 md:py-2 bg-green-100 text-green-800 text-xs md:text-sm font-medium rounded-lg">
                                  <Check size={12} className="md:w-3.5 md:h-3.5" />
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
          {data?.data?.length > 0 && totalPages > 1 && (
            <div className="px-3 md:px-6 py-3 md:py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 md:gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs md:text-sm text-gray-600">Items per page:</span>
                  <select
                    value={queryParams["pagination[limit]"] || 10}
                    onChange={(e) =>
                      updateQueryParams({
                        "pagination[limit]": Number(e.target.value),
                        "pagination[page]": 1,
                      })
                    }
                    className="px-2 md:px-3 py-1 md:py-1.5 border border-gray-300 rounded-md text-xs md:text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-2">
                  <span className="text-xs md:text-sm text-gray-600">
                    Page {queryParams["pagination[page]"] || 1} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <PaginationButton
                      onClick={() => {
                        updateQueryParams({
                          "pagination[page]":
                            Number(queryParams["pagination[page]"]) - 1,
                        });
                      }}
                      disabled={
                        Number(queryParams["pagination[page]"] ?? 1) === 1
                      }
                    >
                      ◀ Previous
                    </PaginationButton>
                    <PaginationButton
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
                    >
                      Next ▶
                    </PaginationButton>
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
