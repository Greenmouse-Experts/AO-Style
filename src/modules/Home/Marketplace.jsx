import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import Breadcrumb from "./components/Breadcrumb";
import { Link } from "react-router-dom";


const initialMarkets = [
    { id: 1, name: "Onitsha Main Market", location: "Anambra", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741212970/AoStyle/image5_lqdp3e.png" },
    { id: 2, name: "Balogun Market", location: "Lagos", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741212981/AoStyle/image5_z4up8a.png" },
    { id: 3, name: "Kanti Kwari Market", location: "Kano", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741212978/AoStyle/image4_uevqus.png" },
    { id: 4, name: "Gbagi Market", location: "Oyo", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741212970/AoStyle/image5_lqdp3e.png" },
    { id: 5, name: "Aba Market", location: "Abia", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741212970/AoStyle/image_monnw6.png" },
];

export default function MarketplaceSection() {
    const [markets, setMarkets] = useState(initialMarkets);
    const [searchTerm, setSearchTerm] = useState("");

    const handleLoadMore = () => {
        const moreMarkets = [
            { id: 6, name: "Oja Oba Market", location: "Osun", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741212970/AoStyle/image5_lqdp3e.png" },
            { id: 7, name: "Kurmi Market", location: "Kano", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741212978/AoStyle/image3_lvscja.png" },
            { id: 8, name: "Idumota Market", location: "Lagos", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741212972/AoStyle/image3_s8h6zh.png" },
        ];
        setMarkets((prev) => [...prev, ...moreMarkets]);
    };

    const filteredMarkets = markets.filter((market) =>
        market.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Breadcrumb
                title="Marketplace"
                subtitle="Access fabric markets all around the country from your home"
                backgroundImage="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741604351/AoStyle/image_ugfmjr.jpg"
            />
            <section className="Resizer section px-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center text-left mb-6">
                    <div>
                        <h2 className="text-2xl font-medium max-w-md leading-relaxed ">Access fabric markets all around the country from your home</h2>
                        <p className="text-[#4B4A4A] mt-4 max-w-md font-light leading-loose mb-6">
                            A virtual marketplace that offers high-quality fabric from various parts of the country.
                        </p>
                    </div>
                    <div className="relative w-full max-w-md">
                        <input
                            type="text"
                            placeholder="Search by keyword"
                            className="w-full border border-gray-300 rounded-full pl-4 pr-10 py-2 focus:outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search size={18} className="absolute right-3 top-3 text-gray-400" />
                    </div>
                </div>

                {/* Marketplace Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mt-8">
                    {filteredMarkets.map((market) => (
                        <Link
                            to={`/inner-marketplace`}
                            key={market.id}
                            className="transition-transform transform hover:scale-105 duration-300"
                        >
                            <div className="text-center">
                                <img
                                    src={market.image}
                                    alt={market.name}
                                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-48 md:h-48 rounded-full object-cover mx-auto"
                                />
                                <h3 className="font-medium mt-6 mb-2">{market.name}</h3>
                                <p className="text-[#2B21E5] text-sm flex items-center justify-center font-light">
                                    <MapPin size={14} className="mr-1" /> {market.location}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>


                {/* Load More Button */}
                <div className="flex justify-center mt-16">
                    <button className="bg-gradient text-white px-6 py-3 cursor-pointer" onClick={handleLoadMore}>
                        Load More Markets
                    </button>
                </div>
            </section>
        </>
    );
}
