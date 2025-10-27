import useQueryParams from "../../../../hooks/useQueryParams";
import useGetNotification from "../../../../hooks/notification/useGetNotification";
import useMarkReadNotification from "../../../../hooks/notification/useMarkReadNotification";
import { Link } from "react-router-dom";


export default function NotificationsCard() {
  const { data, isPending } = useGetNotification({
    "pagination[limit]": 10,
    "pagination[page]": 1,
  });

  const { isPending: markReadIsPending, markReadNotificationMutate } =
    useMarkReadNotification();

  return (
    <div className="bg-white p-6 rounded-xl">
      <div className="flex w-full items-center gap-2" data-theme="nord">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <Link
          to="/customer/notifications"
          className="btn btn-soft btn-primary ml-auto btn-xs"
        >
          See More
        </Link>
      </div>
      <div className="p-2">
        {data?.data?.length ? (
          data?.data.slice(0, 3).map((notification, index) => (
            <div
              key={notification?.id}
              onClick={() => {
                if (!notification?.read) {
                  markReadNotificationMutate(notification?.id);
                }
              }}
              className={`flex items-start py-4 px-4 last:border-none gap-3 ${
                !notification?.read ? "bg-purple-100 cursor-pointer" : ""
              }`}
            >
              <div>
                <p className="text-sm font-medium"> {notification.title}</p>
                <p className="text-xs text-gray-500 mt-3">
                  {notification.message}
                </p>
              </div>
              {!notification.read && (
                <span className="ml-auto text-[#A14DF6] text-xl">•</span>
              )}
            </div>
          ))
        ) : (
          <p className="flex items-center justify-center text-center my-auto h-full text-sm md:text-sm py-8">
            No notifications found.
          </p>
        )}
      </div>
    </div>
  );
}
