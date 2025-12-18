import { useState } from "react";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

const notifications = [
    { id: 1, text: "Your Order No EWRQSDF12GHIJK is arriving today at 5pm", time: "1 hour ago", unread: true },
    { id: 2, text: "Your Order No EWRQSDF12GHIJK is arriving today at 5pm", time: "1 hour ago", unread: false },
    { id: 3, text: "Your Order No EWRQSDF12GHIJK is arriving today at 5pm", time: "18 hours ago", unread: false },
    { id: 4, text: "Your Order No EWRQSDF12GHIJK is arriving today at 5pm", time: "17-05-25", unread: false },
    { id: 5, text: "Your Order No EWRQSDF12GHIJK is arriving today at 5pm", time: "17-05-25", unread: false },
    { id: 6, text: "Your Order No EWRQSDF12GHIJK is arriving today at 5pm", time: "17-05-25", unread: false },
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
                    <Link to="/sales" className="text-blue-500 hover:underline">Dashboard</Link> &gt; Notifications
                </p>
            </div>
            
            <div className="bg-white p-3 md:p-4 lg:p-6 rounded-lg">
                {/* Filters Section */}
                <div className="mb-4 md:mb-6 pb-3 md:pb-4 border-b border-gray-200">
                    <div className="flex flex-col gap-3 md:gap-4">
                        {/* Filter Buttons - Horizontal Scroll on Mobile */}
                        <div className="flex gap-2 md:gap-0 md:space-x-4 lg:space-x-6 text-gray-600 text-xs md:text-sm font-medium overflow-x-auto scrollbar-hide pb-1 -mx-3 md:mx-0 px-3 md:px-0">
                            <button 
                                onClick={() => setFilter("all")} 
                                className={`whitespace-nowrap font-medium pb-2 px-1 transition-colors ${
                                    filter === "all" 
                                        ? "text-[#A14DF6] border-b-2 border-[#A14DF6]" 
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                All Notification
                            </button>
                            <button 
                                onClick={() => setFilter("read")} 
                                className={`whitespace-nowrap font-medium pb-2 px-1 transition-colors ${
                                    filter === "read" 
                                        ? "text-[#A14DF6] border-b-2 border-[#A14DF6]" 
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                All Read (30)
                            </button>
                            <button 
                                onClick={() => setFilter("unread")} 
                                className={`whitespace-nowrap font-medium pb-2 px-1 transition-colors ${
                                    filter === "unread" 
                                        ? "text-[#A14DF6] border-b-2 border-[#A14DF6]" 
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                All Unread (60)
                            </button>
                        </div>

                        {/* Search and Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2 w-full">
                            <div className="relative flex-1">
                                <Search className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search notifications..."
                                    className="pl-8 md:pl-10 pr-3 md:pr-4 py-2 w-full border border-gray-200 rounded-md outline-none text-sm focus:border-[#A14DF6] focus:ring-1 focus:ring-[#A14DF6] transition-colors"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                                <button className="px-3 md:px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-xs md:text-sm whitespace-nowrap transition-colors">
                                    Export As ▼
                                </button>
                                <button className="px-3 md:px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-xs md:text-sm whitespace-nowrap transition-colors">
                                    Sort: Newest First ▼
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="divide-y divide-gray-200">
                    {filteredNotifications.length === 0 ? (
                        <div className="py-8 md:py-12 text-center">
                            <p className="text-gray-500 text-sm md:text-base">No notifications found</p>
                        </div>
                    ) : (
                        filteredNotifications.map((notification) => (
                            <div 
                                key={notification.id} 
                                className={`flex gap-3 md:gap-4 p-3 md:p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                                    notification.unread ? "bg-purple-50 md:bg-purple-100" : "bg-white"
                                }`} 
                                onClick={() => toggleExpand(notification.id)}
                            >
                                <img 
                                    src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741985895/AoStyle/image_cuxdyt.png" 
                                    className="w-10 h-10 md:w-14 md:h-14 flex-shrink-0 rounded-full object-cover" 
                                    alt="notification icon" 
                                />
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm md:text-base break-words leading-relaxed ${
                                        isExpanded(notification.id) ? "" : "line-clamp-2"
                                    }`}>
                                        {notification.text}
                                    </p>
                                    {notification.text && notification.text.length > 100 && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleExpand(notification.id);
                                            }}
                                            className="text-xs md:text-sm text-purple-600 hover:text-purple-700 font-medium mt-1 transition-colors"
                                        >
                                            {isExpanded(notification.id) ? "Show less" : "Show more"}
                                        </button>
                                    )}
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-gray-500 text-xs md:text-sm">{notification.time}</span>
                                        {notification.unread && (
                                            <span className="h-2 w-2 bg-[#A14DF6] rounded-full flex-shrink-0" aria-label="Unread notification"></span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
