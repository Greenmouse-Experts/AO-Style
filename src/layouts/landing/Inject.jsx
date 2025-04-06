import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    ChevronDownIcon,
    BriefcaseIcon,
    UsersIcon,
    ArrowRightIcon,
} from "@heroicons/react/24/outline";

export default function Navbar() {
    const [careersOpen, setCareersOpen] = useState(false);
    const [productOpen, setProductOpen] = useState(false);
    const careersRef = useRef(null);
    const productRef = useRef(null);

    // Handle click outside dropdowns to close them
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                careersRef.current &&
                !careersRef.current.contains(event.target)
            ) {
                setCareersOpen(false);
            }
            if (
                productRef.current &&
                !productRef.current.contains(event.target)
            ) {
                setProductOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <nav className="">
            <div className="hidden md:flex flex-grow justify-left space-x-4 lg:space-x-6 xl:space-x-8 cursor-pointer">
                {/* Product Dropdown */}
                <div
                    className="relative"
                    ref={productRef}
                    onMouseEnter={() => {
                        setProductOpen(true);
                        setCareersOpen(false);
                    }}
                    onMouseLeave={() => setProductOpen(false)}
                >
                    <button className="flex items-center text-[#545252] text-base font-light hover:text-purple-500 transition">
                        Product <ChevronDownIcon className="h-4 w-4 ml-1" />
                    </button>
                    {productOpen && (
                        <div className="absolute top-full w-80 bg-white rounded-lg p-4 z-20">
                            <h4 className="text-gray-500 text-xs uppercase mb-2">
                                Products
                            </h4>
                            <div className="space-y-2">
                                <Link to="/products" className="flex items-center p-3 rounded-lg hover:bg-gray-100">
                                    <img src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741727773/AoStyle/image_jmwiuo.jpg" alt="OA Styles" className="h-12 w-12 rounded-md" />
                                    <p className="ml-4">OA Styles - Tailoring Services</p>
                                    <ArrowRightIcon className="h-6 w-6 text-purple-500 ml-auto" />
                                </Link>
                                <Link to="/marketplace" className="flex items-center p-3 rounded-lg hover:bg-gray-100">
                                    <img src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741727765/AoStyle/Group_1321315093_la6kma.jpg" alt="Marketplace" className="h-12 w-12 rounded-md" />
                                    <p className="ml-4">Marketplace - Buy Fabrics</p>
                                    <ArrowRightIcon className="h-6 w-6 text-purple-500 ml-auto" />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Careers Dropdown */}
                <div
                    className="relative"
                    ref={careersRef}
                    onMouseEnter={() => {
                        setCareersOpen(true);
                        setProductOpen(false);
                    }}
                    onMouseLeave={() => setCareersOpen(false)}
                >
                    <button className="flex items-center text-[#545252] text-base font-light hover:text-purple-500 transition">
                        Careers <ChevronDownIcon className="h-4 w-4 ml-1" />
                    </button>
                    {careersOpen && (
                        <div className="absolute top-full left-0 bg-white p-4 rounded-md w-66 z-20">
                            <a
                                href="#"
                                className="flex items-center px-4 py-4 text-gray-800 hover:bg-gray-100 rounded-lg"
                            >
                                <UsersIcon className="h-6 w-6 text-purple-600 mr-4" />
                                Become A Market Rep
                            </a>
                            <a
                                href="#"
                                className="flex items-center px-4 py-4 text-gray-800 hover:bg-gray-100 rounded-lg"
                            >
                                <BriefcaseIcon className="h-6 w-6 text-purple-600 mr-4" />
                                See All Jobs
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
