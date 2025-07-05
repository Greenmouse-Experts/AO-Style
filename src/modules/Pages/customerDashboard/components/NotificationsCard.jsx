import { Bell } from "lucide-react";

const notifications = [
    { message: "Order has been moved to the tailor", subMessage: "Your order is in the next stage" },
    { message: "Order has been moved to the tailor", subMessage: "Your order is in the next stage" },
    { message: "Order has been moved to the tailor", subMessage: "Your order is in the next stage" },
    { message: "Order has been moved to the tailor", subMessage: "Your order is in the next stage" },
];

export default function NotificationsCard() {
    return (
        <div className="bg-white p-6 rounded-xl">
            <h3 className="font-medium text-lg mb-4">Recent Notifications</h3>
            {notifications.map((item, index) => (
                <div key={index} className="flex items-start gap-3 py-2 last:border-none">
                    <div className="flex items-center justify-center bg-gray-200 rounded-full">
                        <img src=" https://res.cloudinary.com/greenmouse-tech/image/upload/v1741985895/AoStyle/image_cuxdyt.png" className="w-14 h-14 rounded-md" />
                       
                    </div>
                    <div>
                        <p className="text-sm font-medium">{item.message}</p>
                        <p className="text-xs text-gray-500 mt-3">{item.subMessage}</p>
                    </div>
                    <span className="ml-auto text-[#A14DF6] text-xl">•</span>
                </div>
            ))}
        </div>
    );
}
