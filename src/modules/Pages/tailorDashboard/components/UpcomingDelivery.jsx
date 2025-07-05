const deliveries = [
    { name: "Two Piece Ankara", daysLeft: 2, image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741984280/AoStyle/image3_thyolr.png", progress: 20, color: "#F82424" },
    { name: "Two Piece Ankara", daysLeft: 4, image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741984280/AoStyle/image4_dkiyz7.png", progress: 30, color: "#2CBA2C" },
    { name: "Two Piece Ankara", daysLeft: 8, image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741984280/AoStyle/image1_ghkqjm.png", progress: 80, color: "#2CBA2C" },
    { name: "Two Piece Ankara", daysLeft: 1, image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741984280/AoStyle/image_e4dzqh.png", progress: 50, color: "#FFF9C1" },
    { name: "Agbada & Cap", daysLeft: 5, image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741984280/AoStyle/image3_thyolr.png", progress: 60, color: "#FFA500" },
    { name: "Casual Senator Wear", daysLeft: 3, image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741984280/AoStyle/image_e4dzqh.png", progress: 25, color: "#00AEEF" },
    { name: "Short Sleeve Kaftan", daysLeft: 7, image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741984280/AoStyle/image1_ghkqjm.png", progress: 90, color: "#8A2BE2" },
   
];



export default function UpcomingDelivery() {
    return (
        <div className="bg-white p-6 rounded-xl">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-lg">Upcoming Delivery</h3>
                <button className="bg-gray-200 text-gray-600 px-4 py-1 rounded-lg text-sm">Monthly ⌄</button>
            </div>
            {deliveries.map((item, index) => (
                <div key={index} className="flex items-center gap-3 mb-3">
                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-md" />
                    <div className="flex-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <div className="relative w-full h-1 bg-gray-300 rounded-full mt-4">
                            <div
                                className="absolute h-1 rounded-full"
                                style={{ width: `${item.progress}%`, backgroundColor: item.color }}
                            />
                        </div>
                    </div>
                    <span className={`text-xs ${item.daysLeft <= 2 ? "text-red-500" : "text-gray-500"}`}>
                        ({item.daysLeft} days left)
                    </span>
                </div>
            ))}
        </div>
    );
}
