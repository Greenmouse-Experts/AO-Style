import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDownIcon,
  BriefcaseIcon,
  UsersIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import Cookies from "js-cookie";
import { useCarybinUserStore } from "../../store/carybinUserStore";

export default function Navbar() {
  const [careersOpen, setCareersOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const careersRef = useRef(null);
  const productRef = useRef(null);

  // Authentication check
  const { carybinUser } = useCarybinUserStore();
  const token = Cookies.get("token");
  const currUrl = Cookies.get("currUserUrl");
  const isLoggedIn = token && currUrl && carybinUser;

  // Handle click outside dropdowns to close them
  useEffect(() => {
    function handleClickOutside(event) {
      if (careersRef.current && !careersRef.current.contains(event.target)) {
        setCareersOpen(false);
      }
      if (productRef.current && !productRef.current.contains(event.target)) {
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
          <button className="flex items-center text-[#545252] text-base font-medium hover:text-purple-600 transition-colors duration-200 relative group">
            Product 
            <ChevronDownIcon className={`h-4 w-4 ml-1 transition-transform duration-300 ${productOpen ? "rotate-180 text-purple-600" : ""}`} />
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-300 group-hover:w-full"></span>
          </button>
          {productOpen && (
            <div className="absolute top-full left-0 pt-2 w-96 z-50">
              <div className="bg-white rounded-xl shadow-2xl border border-purple-100 overflow-hidden transform transition-all duration-300 ease-out opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]">
                <div className="px-5 py-4 bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-100">
                  <h4 className="text-purple-700 text-xs font-semibold uppercase tracking-wider">Our Products</h4>
                </div>
                <div className="p-4 space-y-2">
                  <Link
                    to="/products"
                    className="flex items-center p-4 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 cursor-pointer transition-all duration-200 group border border-transparent hover:border-purple-200 hover:shadow-md"
                  >
                    <div className="relative overflow-hidden rounded-lg">
                      <img
                        src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741727773/AoStyle/image_jmwiuo.jpg"
                        alt="OA Styles"
                        className="h-14 w-14 rounded-lg object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">OA Styles</p>
                      <p className="text-xs text-gray-500 mt-0.5">Tailoring Services</p>
                    </div>
                    <ArrowRightIcon className="h-5 w-5 text-purple-500 ml-auto group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                  <Link
                    to="/marketplace"
                    className="flex items-center p-4 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 cursor-pointer transition-all duration-200 group border border-transparent hover:border-purple-200 hover:shadow-md"
                  >
                    <div className="relative overflow-hidden rounded-lg">
                      <img
                        src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741727765/AoStyle/Group_1321315093_la6kma.jpg"
                        alt="Marketplace"
                        className="h-14 w-14 rounded-lg object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">Marketplace</p>
                      <p className="text-xs text-gray-500 mt-0.5">Buy Fabrics</p>
                    </div>
                    <ArrowRightIcon className="h-5 w-5 text-purple-500 ml-auto group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </div>
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
          <button className="flex items-center text-[#545252] text-base font-medium hover:text-purple-600 transition-colors duration-200 relative group">
            Careers 
            <ChevronDownIcon className={`h-4 w-4 ml-1 transition-transform duration-300 ${careersOpen ? "rotate-180 text-purple-600" : ""}`} />
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-300 group-hover:w-full"></span>
          </button>
          {careersOpen && (
            <div className="absolute top-full left-0 pt-2 w-72 z-50">
              <div className="bg-white rounded-xl shadow-2xl border border-purple-100 overflow-hidden transform transition-all duration-300 ease-out opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]">
                <div className="px-5 py-4 bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-100">
                  <h4 className="text-purple-700 text-xs font-semibold uppercase tracking-wider">Career Opportunities</h4>
                </div>
                <div className="p-4 space-y-2">
                  {!isLoggedIn && (
                    <Link
                      to="/sign-in-as-market-rep"
                      className="flex items-center px-4 py-4 text-gray-800 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 rounded-xl cursor-pointer transition-all duration-200 group border border-transparent hover:border-purple-200 hover:shadow-md"
                    >
                      <div className="p-2 bg-purple-100 rounded-lg mr-4 group-hover:bg-purple-200 group-hover:scale-110 transition-all duration-200">
                        <BriefcaseIcon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">Become A Market Rep</p>
                        <p className="text-xs text-gray-500 mt-0.5">Join our team</p>
                      </div>
                      <ArrowRightIcon className="h-5 w-5 text-purple-500 ml-auto group-hover:translate-x-1 transition-transform duration-200" />
                    </Link>
                  )}

                  <Link
                    to="/jobs"
                    className="flex items-center px-4 py-4 text-gray-800 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 rounded-xl cursor-pointer transition-all duration-200 group border border-transparent hover:border-purple-200 hover:shadow-md"
                  >
                    <div className="p-2 bg-purple-100 rounded-lg mr-4 group-hover:bg-purple-200 group-hover:scale-110 transition-all duration-200">
                      <UsersIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">See All Jobs</p>
                      <p className="text-xs text-gray-500 mt-0.5">Explore opportunities</p>
                    </div>
                    <ArrowRightIcon className="h-5 w-5 text-purple-500 ml-auto group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
