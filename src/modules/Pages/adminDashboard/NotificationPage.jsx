import { useState } from "react";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

import useQueryParams from "../../../hooks/useQueryParams";
import useGetNotification from "../../../hooks/notification/useGetNotification";
import Loader from "../../../components/ui/Loader";
import useDebounce from "../../../hooks/useDebounce";
import useUpdatedEffect from "../../../hooks/useUpdatedEffect";
import { formatDateStr } from "../../../lib/helper";

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

export default function NotificationPageUpdate() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "read" && notification.unread) return false;
    if (filter === "unread" && !notification.unread) return false;
    return notification.text.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const { queryParams, updateQueryParams } = useQueryParams({
    "pagination[limit]": 10,
    "pagination[page]": 1,
  });

  const { data, isPending } = useGetNotification({
    ...queryParams,
  });

  const [queryString, setQueryString] = useState(queryParams.q);

  const debouncedSearchTerm = useDebounce(queryString ?? "", 1000);

  useUpdatedEffect(() => {
    // update search params with undefined if debouncedSearchTerm is an empty string
    updateQueryParams({
      q: debouncedSearchTerm.trim() || undefined,
      "pagination[page]": 1,
    });
  }, [debouncedSearchTerm]);

  console.log(data?.data?.length);

  return (
    <div className="">
      <div className="bg-white px-6 py-4 mb-6">
        <h1 className="text-2xl font-medium mb-3">Notifications</h1>
        <p className="text-gray-500">
          <Link to="/admin" className="text-blue-500 hover:underline">
            Dashboard
          </Link>{" "}
          &gt; Notifications
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg">
        <div className="flex flex-wrap justify-between items-center pb-3 mb-4 gap-4">
          <div className="flex flex-wrap space-x-6 text-gray-600 text-sm font-medium">
            <button
              onClick={() => {
                setFilter("all");
                updateQueryParams({
                  read: undefined,
                  "pagination[page]": 1,
                });
              }}
              className={`font-medium ${
                filter === "all"
                  ? "text-[#A14DF6] border-b-2 border-[#A14DF6]"
                  : "text-gray-500"
              }`}
            >
              All Notification{" "}
              {filter === "all" && data?.count ? `(${data?.count})` : <></>}
            </button>
            <button
              onClick={() => {
                setFilter("read");
                updateQueryParams({
                  read: true,
                  "pagination[page]": 1,
                });
              }}
              className={`font-medium ${
                filter === "read"
                  ? "text-[#A14DF6] border-b-2 border-[#A14DF6]"
                  : "text-gray-500"
              }`}
            >
              All Read{" "}
              {filter === "read" && data?.count ? `(${data?.count})` : <></>}
            </button>
            <button
              onClick={() => {
                setFilter("unread");
                updateQueryParams({
                  read: false,
                  "pagination[page]": 1,
                });
              }}
              className={`font-medium ${
                filter === "unread"
                  ? "text-[#A14DF6] border-b-2 border-[#A14DF6]"
                  : "text-gray-500"
              }`}
            >
              All Unread{" "}
              {filter === "unread" && data?.count ? `(${data?.count})` : <></>}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search"
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-md outline-none"
                value={queryString}
                onChange={(evt) =>
                  setQueryString(
                    evt.target.value ? evt.target.value : undefined
                  )
                }
              />
            </div>
            <button className="px-4 py-2 bg-gray-200 rounded-md">
              Export As ▼
            </button>
            <button className="px-4 py-2 bg-gray-200 rounded-md">
              Sort: Newest First ▼
            </button>
          </div>
        </div>

        {isPending ? (
          <div className=" flex !w-full items-center justify-center">
            <Loader />
          </div>
        ) : (
          <div>
            {data?.data?.length ? (
              data?.data?.map((notification) => (
                <div
                  key={notification?.id}
                  className={`flex flex-wrap  items-center p-5 gap-3 ${
                    !notification?.read ? "bg-purple-100 cursor-pointer" : ""
                  }`}
                >
                  <img
                    src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741985895/AoStyle/image_cuxdyt.png"
                    className="w-14 h-14"
                    alt="icon"
                  />
                  <div className="flex-1">
                    {" "}
                    <p className="flex-1 text-sm md:text-sm">
                      {notification.title}
                    </p>
                    <p className="flex-1 text-[12px] text-gray-500">
                      {notification.message}
                    </p>
                  </div>
                  <span className="text-gray-600 text-sm md:text-sm">
                    {notification?.created_at
                      ? formatDateStr(
                          notification?.created_at.split(".").shift(),
                          "relative"
                        )
                      : ""}
                  </span>
                  {!notification.read && (
                    <span className="ml-2 h-2 w-2 bg-[#A14DF6] rounded-full"></span>
                  )}
                </div>
              ))
            ) : (
              <p className="flex-1 text-center text-sm md:text-sm">
                No notifications found.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
