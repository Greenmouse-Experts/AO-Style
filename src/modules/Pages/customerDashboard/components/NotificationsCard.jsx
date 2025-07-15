import { Bell } from "lucide-react";
import useQueryParams from "../../../../hooks/useQueryParams";
import useGetNotification from "../../../../hooks/notification/useGetNotification";

const notifications = [
  {
    message: "Order has been moved to the tailor",
    subMessage: "Your order is in the next stage",
  },
  {
    message: "Order has been moved to the tailor",
    subMessage: "Your order is in the next stage",
  },
  {
    message: "Order has been moved to the tailor",
    subMessage: "Your order is in the next stage",
  },
  {
    message: "Order has been moved to the tailor",
    subMessage: "Your order is in the next stage",
  },
];

export default function NotificationsCard() {
  const { data, isPending } = useGetNotification({
    "pagination[limit]": 10,
    "pagination[page]": 1,
  });

  return (
    <div className="bg-white p-6 rounded-xl">
      <h3 className="font-medium text-lg mb-4">Recent Notifications</h3>
      {data?.data?.length ? (
        data?.data.map((notification, index) => (
          <div
            key={notification?.id}
            className={`flex items-start py-2 last:border-none gap-3 ${
              !notification?.read ? "bg-purple-100 cursor-pointer" : ""
            }`}
            // className="flex items-start gap-3 py-2 last:border-none"
          >
            <div className="flex items-center justify-center bg-gray-200 rounded-full">
              <img
                src=" https://res.cloudinary.com/greenmouse-tech/image/upload/v1741985895/AoStyle/image_cuxdyt.png"
                className="w-14 h-14 rounded-md"
              />
            </div>
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
        <p className="flex items-center justify-center text-center my-auto h-full text-sm md:text-sm">
          No notifications found.
        </p>
      )}
    </div>
  );
}
