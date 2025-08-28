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
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "read" && notification.unread) return false;
    if (filter === "unread" && !notification.unread) return false;
    return notification.text.toLowerCase().includes(searchTerm.toLowerCase());
  });
  const { data } = useGetUserProfile();

  return (
    <div className="">
      <div className="bg-white px-6 py-4 mb-6">
        <h1 className="text-2xl font-medium mb-3">Notifications</h1>
        <p className="text-gray-500">
          <Link to="/logistics" className="text-blue-500 hover:underline">
            Dashboard
          </Link>{" "}
          &gt; Notifications
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg">
        <div className="flex flex-wrap justify-between items-center pb-3 mb-4 gap-4">
          <div className="flex flex-wrap space-x-6 text-gray-600 text-sm font-medium">
            <button
              onClick={() => setFilter("all")}
              className={`font-medium ${filter === "all" ? "text-[#A14DF6] border-b-2 border-[#A14DF6]" : "text-gray-500"}`}
            >
              All Notification
            </button>
            <button
              onClick={() => setFilter("read")}
              className={`font-medium ${filter === "read" ? "text-[#A14DF6] border-b-2 border-[#A14DF6]" : "text-gray-500"}`}
            >
              All Read (30)
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`font-medium ${filter === "unread" ? "text-[#A14DF6] border-b-2 border-[#A14DF6]" : "text-gray-500"}`}
            >
              All Unread (60)
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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

        <div>
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex flex-wrap items-center p-5 gap-3 ${notification.unread ? "bg-purple-100" : ""}`}
            >
              {/* <img
                src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741985895/AoStyle/image_cuxdyt.png"
                className="w-14 h-14"
                alt="icon"
              />*/}
              <p className="flex-1 text-sm md:text-sm">{notification.text}</p>
              <span className="text-gray-500 text-xs md:text-sm">
                {notification.time}
              </span>
              {notification.unread && (
                <span className="ml-2 h-2 w-2 bg-[#A14DF6] rounded-full"></span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
