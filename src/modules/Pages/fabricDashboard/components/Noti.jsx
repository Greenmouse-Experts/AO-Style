import useGetNotification from "../../../../hooks/notification/useGetNotification";
import useMarkReadNotification from "../../../../hooks/notification/useMarkReadNotification";


export default function Notifications() {
  const { data, isPending } = useGetNotification({
    "pagination[limit]": 3,
    "pagination[page]": 1,
  });

  const { isPending: markReadIsPending, markReadNotificationMutate } =
    useMarkReadNotification();

    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-lg text-gray-800">Recent Notifications</h3>
        </div>
        
        {data?.data?.length ? (
          <div className="space-y-3">
            {data?.data?.map((notification) => (
              <div
                key={notification?.id}
                className={`group relative flex items-start gap-4 p-4 rounded-lg transition-all duration-200 ${
                  !notification?.read
                    ? "bg-purple-50 hover:bg-purple-100 cursor-pointer border border-purple-200"
                    : "hover:bg-gray-50 cursor-pointer"
                }`}
                onClick={() => {
                  if (!notification?.read) {
                    markReadNotificationMutate(notification?.id);
                  }
                }}
              >
                {/* Icon/Image */}
                <div className="flex-shrink-0 relative">
                  <div className={`w-12 h-12 rounded-full overflow-hidden ${
                    !notification?.read ? "ring-2 ring-purple-300" : ""
                  }`}>
                    <img
                      src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741985895/AoStyle/image_cuxdyt.png"
                      alt={notification.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {!notification.read && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border-2 border-white"></span>
                  )}
                </div>
    
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium ${
                      !notification?.read ? "text-gray-900" : "text-gray-700"
                    }`}>
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <span className="flex-shrink-0 text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">No notifications yet</p>
          </div>
        )}
      </div>
    );
}
