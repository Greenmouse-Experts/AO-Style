import useGetNotification from "../../../../hooks/notification/useGetNotification";
import useMarkReadNotification from "../../../../hooks/notification/useMarkReadNotification";

const notifications = [
  {
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741984280/AoStyle/image_e4dzqh.png",
    title: "New Purchase",
    message: "Congrats, you just sold a new material",
  },
  {
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741984280/AoStyle/image_e4dzqh.png",
    title: "New Purchase",
    message: "Congrats, you just sold a new material",
  },
  {
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741984280/AoStyle/image_e4dzqh.png",
    title: "New Purchase",
    message: "Congrats, you just sold a new material",
  },
  {
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741984280/AoStyle/image_e4dzqh.png",
    title: "New Purchase",
    message: "Congrats, you just sold a new material",
  },
  {
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741984280/AoStyle/image_e4dzqh.png",
    title: "New Purchase",
    message: "Congrats, you just sold a new material",
  },
  {
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741984280/AoStyle/image_e4dzqh.png",
    title: "New Purchase",
    message: "Congrats, you just sold a new material",
  },
];

export default function Notifications() {
  const { data, isPending } = useGetNotification({
    "pagination[limit]": 5,
    "pagination[page]": 1,
  });

  const { isPending: markReadIsPending, markReadNotificationMutate } =
    useMarkReadNotification();

  return (
    <div className="bg-white p-6 rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-lg">Recent Notifications</h3>
        {/* <button className="bg-gray-200 text-gray-600 px-4 py-1 rounded-lg text-sm">
          Daily ⌄
        </button> */}
      </div>
      {data?.data?.length ? (
        data?.data?.map((notification, index) => (
          <div
            key={notification?.id}
            className={`flex items-start gap-4 p-2  mb-5 ${
              !notification?.read ? "bg-purple-100 cursor-pointer rounded" : ""
            }`}
            onClick={() => {
              if (!notification?.read) {
                markReadNotificationMutate({ id: notification?.id });
              }
            }}

            // className="flex items-start gap-3 py-2 last:border-none"
          >
            <div className="flex items-center justify-center bg-gray-200 rounded-full">
              <img
                src=" https://res.cloudinary.com/greenmouse-tech/image/upload/v1741985895/AoStyle/image_cuxdyt.png"
                alt={notification.title}
                className="w-12 h-12 rounded-full"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{notification.title}</p>
              <p className="text-xs text-gray-500 mt-2 w-50 truncate">
                {notification.message}
              </p>
            </div>
            {!notification.read && (
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            )}
          </div>
        ))
      ) : (
        <p className="flex items-center justify-center text-center my-auto h-full text-sm md:text-sm">
          No notifications found.
        </p>
      )}
      {/* {notifications.map((item, index) => (
        <div key={index} className="flex items-center gap-4 mb-5">
          <img
            src={item.image}
            alt={item.title}
            className="w-12 h-12 rounded-full"
          />
          <div className="flex-1">
            <p className="text-sm font-medium">{item.title}</p>
            <p className="text-xs text-gray-500 mt-2">{item.message}</p>
          </div>
          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
        </div>
      ))} */}
    </div>
  );
}
