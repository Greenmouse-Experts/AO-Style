import { useState } from "react";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import useGetUserProfile from "../../Auth/hooks/useGetProfile";

const notifications = [
  {
    id: 1,
    text: "Your Order No EWRQSDF12GHIJK is arriving today at 5pm",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: 2,
    text: "Your Order No EWRQSDF12GHIJK is arriving today at 5pm",
    time: "1 hour ago",
    unread: false,
  },
  {
    id: 3,
    text: "Your Order No EWRQSDF12GHIJK is arriving today at 5pm",
    time: "18 hours ago",
    unread: false,
  },
  {
    id: 4,
    text: "Your Order No EWRQSDF12GHIJK is arriving today at 5pm",
    time: "17-05-25",
    unread: false,
  },
  {
    id: 5,
    text: "Your Order No EWRQSDF12GHIJK is arriving today at 5pm",
    time: "17-05-25",
    unread: false,
  },
  {
    id: 6,
    text: "Your Order No EWRQSDF12GHIJK is arriving today at 5pm",
    time: "17-05-25",
    unread: false,
  },
];

export default function NotificationPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [expandedNotifications, setExpandedNotifications] = useState(new Set());
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "read" && notification.unread) return false;
    if (filter === "unread" && !notification.unread) return false;
    return notification.text.toLowerCase().includes(searchTerm.toLowerCase());
  });
  const { data } = useGetUserProfile();

  const toggleExpand = (notificationId) => {
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

  const isExpanded = (notificationId) => {
    return expandedNotifications.has(notificationId);
  };

  return (
    <div className="pb-4">
      <div className="bg-white px-3 md:px-6 py-3 md:py-4 mb-4 md:mb-6">
        <h1 className="text-lg md:text-2xl font-medium mb-2 md:mb-3">Notifications</h1>
        <p className="text-xs md:text-sm text-gray-500">
          <Link to="/logistics" className="text-blue-500 hover:underline">
            Dashboard
          </Link>{" "}
          &gt; Notifications
        </p>
      </div>

      <div className="bg-white p-3 md:p-4 rounded-lg">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center pb-3 mb-4 gap-3 md:gap-4">
          <div className="flex flex-wrap gap-2 md:gap-0 md:space-x-4 lg:space-x-6 text-gray-600 text-xs md:text-sm font-medium overflow-x-auto">
            <button
              onClick={() => setFilter("all")}
              className={`whitespace-nowrap font-medium pb-2 ${filter === "all" ? "text-[#A14DF6] border-b-2 border-[#A14DF6]" : "text-gray-500"}`}
            >
              All Notification
            </button>
            <button
              onClick={() => setFilter("read")}
              className={`whitespace-nowrap font-medium pb-2 ${filter === "read" ? "text-[#A14DF6] border-b-2 border-[#A14DF6]" : "text-gray-500"}`}
            >
              All Read (30)
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`whitespace-nowrap font-medium pb-2 ${filter === "unread" ? "text-[#A14DF6] border-b-2 border-[#A14DF6]" : "text-gray-500"}`}
            >
              All Unread (60)
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search
                className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search"
                className="pl-8 md:pl-10 pr-3 md:pr-4 py-2 w-full sm:w-auto border border-gray-200 rounded-md outline-none text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="px-3 md:px-4 py-2 bg-gray-200 rounded-md text-xs md:text-sm whitespace-nowrap">
              Export As ▼
            </button>
            <button className="px-3 md:px-4 py-2 bg-gray-200 rounded-md text-xs md:text-sm whitespace-nowrap">
              Sort: Newest First ▼
            </button>
          </div>
        </div>

        <div>
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex flex-col sm:flex-row sm:items-center p-3 md:p-5 gap-2 md:gap-3 cursor-pointer transition-colors hover:bg-gray-50 ${notification.unread ? "bg-purple-100" : ""}`}
              onClick={() => toggleExpand(notification.id)}
            >
              <div className="flex-1 min-w-0">
                <p className={`text-sm md:text-base break-words ${isExpanded(notification.id) ? "" : "line-clamp-2"}`}>
                  {notification.text}
                </p>
                {notification.text && notification.text.length > 100 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(notification.id);
                    }}
                    className="text-xs md:text-sm text-purple-600 hover:text-purple-700 font-medium mt-1"
                  >
                    {isExpanded(notification.id) ? "Show less" : "Show more"}
                  </button>
                )}
                <div className="flex items-center gap-2 mt-1 md:mt-0">
                  <span className="text-gray-500 text-xs md:text-sm">
                    {notification.time}
                  </span>
                  {notification.unread && (
                    <span className="h-2 w-2 bg-[#A14DF6] rounded-full flex-shrink-0"></span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
