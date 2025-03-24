import { useState } from "react";
import { Search , MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";

const styles = [
    { id: 1, name: "Red Up and Down Kaftan", price: "N 7000", sold: 17, rating: 4.5, income: "N 200K", status: "Published", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741984280/AoStyle/image3_thyolr.png" },
    { id: 2, name: "Red Ankara Material", price: "N 7000", sold: 17, rating: 4.5, income: "N 200K", status: "Published", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741984280/AoStyle/image4_dkiyz7.png" },
    { id: 3, name: "Red Up and Down Kaftan", price: "N 7000", sold: 17, rating: 4.5, income: "N 200K", status: "Unpublished", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741984280/AoStyle/image1_ghkqjm.png" },
    { id: 4, name: "Red Up and Down Kaftan", price: "N 7000", sold: 17, rating: 4.5, income: "N 200K", status: "Published", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741984280/AoStyle/image_e4dzqh.png" },
];

export default function StylesTable() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("all");
    const [openDropdown, setOpenDropdown] = useState(null);

    const filteredStyles = styles.filter((style) => {
        if (filter === "published" && style.status !== "Published") return false;
        if (filter === "unpublished" && style.status !== "Unpublished") return false;
        return style.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div>
            <div className="bg-white px-6 py-4 mb-6">
                <h1 className="text-2xl font-medium mb-3">All Styles</h1>
                <p className="text-gray-500">
                    <Link to="/dashboard" className="text-blue-500 hover:underline">Dashboard</Link> &gt; Styles
                </p>
            </div>

            <div className="bg-white p-4 rounded-lg">
                <div className="flex justify-between items-center pb-3 mb-4">
                    <div className="flex space-x-6 text-sm font-medium">
                        <button onClick={() => setFilter("all")} className={`font-medium ${filter === "all" ? "text-[#A14DF6] border-b-2 border-[#A14DF6]" : "text-gray-500"}`}>
                            All Styles
                        </button>
                        <button onClick={() => setFilter("published")} className={`font-medium ${filter === "published" ? "text-[#A14DF6] border-b-2 border-[#A14DF6]" : "text-gray-500"}`}>
                            Published Styles
                        </button>
                        <button onClick={() => setFilter("unpublished")} className={`font-medium ${filter === "unpublished" ? "text-[#A14DF6] border-b-2 border-[#A14DF6]" : "text-gray-500"}`}>
                            Unpublished Styles
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search"
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-md outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="px-4 py-2 bg-gray-200 rounded-md">Export As ▼</button>
                        <button className="px-4 py-2 bg-gray-200 rounded-md">Sort: Newest First ▼</button>
                    </div>
                </div>

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-200 text-gray-500 text-sm">
                            <th className="py-3">Style</th>
                            <th>Price</th>
                            <th>Sold</th>
                            <th>Status</th>
                            <th>Rating</th>
                            <th>Income</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStyles.map((style) => (
                            <tr key={style.id} className="border-b border-gray-200">
                                <td className="flex items-center space-x-3 py-4">
                                    <img src={style.image} alt={style.name} className="w-16 h-16 rounded-md" />
                                    <div>
                                        <p className="font-medium">{style.name}</p>
                                        <p className="text-sm text-gray-500">Ankara</p>
                                        <p className="text-xs text-gray-400">Uploaded on 02-12-25</p>
                                    </div>
                                </td>
                                <td>{style.price}</td>
                                <td>{style.sold}</td>
                                <td>
                                    <span className={`px-3 py-1 text-sm rounded-md ${style.status === "Published" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                                        {style.status}
                                    </span>
                                </td>
                                <td>{style.rating}</td>
                                <td>{style.income}</td>
                                <td className="relative">
                                    <button onClick={() => setOpenDropdown(openDropdown === style.id ? null : style.id)}>
                                        <MoreVertical className="text-gray-500" />
                                    </button>
                                    {openDropdown === style.id && (
                                        <div className="absolute right-0 mt-2 bg-white shadow-md rounded-md py-2 w-32 z-50">
                                            <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Edit</button>
                                            <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Delete</button>
                                            <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">View Details</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
