import { useState } from "react";
import { Search, Filter, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const tailors = [
    { id: 1, name: "Benson Omotayo", business: "Stitches & Cuts", phone: "+234 123 456 7890", email: "stitchesncuts@gmail.com", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741993355/AoStyle/image_ehwmo7.jpg" },
    { id: 2, name: "Jane Doe", business: "Elegant Styles", phone: "+234 987 654 3210", email: "elegantstyles@gmail.com", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741993355/AoStyle/image_ehwmo7.jpg" },
    { id: 3, name: "Michael Smith", business: "Tailor Pro", phone: "+234 111 222 3333", email: "tailorpro@gmail.com", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741993355/AoStyle/image_ehwmo7.jpg" },
    { id: 4, name: "Sarah Johnson", business: "Classic Cuts", phone: "+234 444 555 6666", email: "classiccuts@gmail.com", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741993355/AoStyle/image_ehwmo7.jpg" },
    { id: 5, name: "Emeka Chukwu", business: "Naija Tailor", phone: "+234 777 888 9999", email: "naijatailor@gmail.com", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741993355/AoStyle/image_ehwmo7.jpg" },
    { id: 6, name: "Aisha Bello", business: "Royal Stitches", phone: "+234 555 666 7777", email: "royalstitches@gmail.com", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741993355/AoStyle/image_ehwmo7.jpg" },
    { id: 7, name: "David Ade", business: "Swift Fittings", phone: "+234 123 999 8888", email: "swiftfittings@gmail.com", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741993355/AoStyle/image_ehwmo7.jpg" },
    { id: 8, name: "Chioma Nwosu", business: "Ankara Designs", phone: "+234 432 678 1234", email: "ankaradesigns@gmail.com", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741993355/AoStyle/image_ehwmo7.jpg" },
    { id: 9, name: "Olumide Fasina", business: "Lagos Trends", phone: "+234 876 543 2109", email: "lagostrends@gmail.com", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741993355/AoStyle/image_ehwmo7.jpg" },
    { id: 10, name: "Blessing Okonkwo", business: "Divine Stitches", phone: "+234 234 567 8901", email: "divinestitches@gmail.com", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741993355/AoStyle/image_ehwmo7.jpg" },
];


export default function HireTailor() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredTailors = tailors.filter(tailor =>
        tailor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tailor.business.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-medium">Tailor Hiring</h1>
                    <p className="text-gray-500">
                        <Link to="/customer" className="text-blue-500 hover:underline">Dashboard</Link> &gt; Tailor Hiring
                    </p>
                </div>
                {/* Search & Filter */}
                <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none w-full md:w-auto">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search"
                            className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-200 outline-none rounded-md"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="p-2 bg-gray-200 rounded-md flex items-center">
                        <Filter size={18} className="mr-1" /> Filter
                    </button>
                    <button className="p-2 bg-gray-200 rounded-md flex items-center">
                        <MapPin size={18} className="mr-1" /> Location
                    </button> </div>
            </div>

            {/* Tailors List - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredTailors.map((tailor) => (
                    <div key={tailor.id} className="bg-white p-4 rounded-lg text-center">
                        <img
                            src={tailor.image}
                            alt={tailor.name}
                            className="w-20 h-20 rounded-full mx-auto mb-4"
                        />
                        <h3 className="font-semibold">{tailor.name}</h3>
                        <p className="text-gray-500">{tailor.business}</p>
                        <p className="text-dark flex items-center justify-center mt-2 mb-3">
                            <img
                                src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741900777/AoStyle/Vector_n3qkjf.png"
                                className="h-5 w-5 mr-3" draggable="false" alt="Phone Icon"
                            />
                            {tailor.phone}
                        </p>
                        <p className="text-dark flex items-center justify-center">
                            <img
                                src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741900778/AoStyle/Frame_1618873241_e12zlr.png"
                                draggable="false" className="h-5 w-5 mr-3" alt="Email Icon"
                            />
                            {tailor.email}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
