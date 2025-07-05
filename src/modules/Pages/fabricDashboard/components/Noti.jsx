const notifications = [
    { image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741984280/AoStyle/image_e4dzqh.png", title: "New Purchase", message: "Congrats, you just sold a new material" },
    { image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741984280/AoStyle/image_e4dzqh.png", title: "New Purchase", message: "Congrats, you just sold a new material" },
    { image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741984280/AoStyle/image_e4dzqh.png", title: "New Purchase", message: "Congrats, you just sold a new material" },
    { image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741984280/AoStyle/image_e4dzqh.png", title: "New Purchase", message: "Congrats, you just sold a new material" },
    { image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741984280/AoStyle/image_e4dzqh.png", title: "New Purchase", message: "Congrats, you just sold a new material" },
    { image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741984280/AoStyle/image_e4dzqh.png", title: "New Purchase", message: "Congrats, you just sold a new material" }
];

export default function Notifications() {
    return (
        <div className="bg-white p-6 rounded-xl">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-lg">Notifications</h3>
                <button className="bg-gray-200 text-gray-600 px-4 py-1 rounded-lg text-sm">Daily ⌄</button>
            </div>
            {notifications.map((item, index) => (
                <div key={index} className="flex items-center gap-4 mb-5">
                    <img src={item.image} alt={item.title} className="w-12 h-12 rounded-full" />
                    <div className="flex-1">
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-2">{item.message}</p>
                    </div>
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                </div>
            ))}
        </div>
    );
}
