import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  UserIcon,
  ChevronDownIcon,
  BriefcaseIcon,
  UsersIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [careersOpen, setCareersOpen] = useState(false);
  const [mobileCareersOpen, setMobileCareersOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [mobileProductOpen, setMobileProductOpen] = useState(false);
  const searchRef = useRef(null);
  const menuRef = useRef(null);
  const careersRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
      if (careersRef.current && !careersRef.current.contains(event.target)) {
        setCareersOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white fixed w-full z-[95] py-3">
      <div className="Resizer">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 pr-3 lg:pr-5 xl:pr-20">
            <Link to="/">
              <img
                src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741724592/AoStyle/Vector_kcxfqx.png"
                alt="OA Styles"
                className="h-12 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-grow justify-left space-x-4 lg:space-x-6 xl:space-x-8 cursor-pointer">
            {[{ name: "Home", link: "/" },
            { name: "About", link: "/about" },
            { name: "FAQs", link: "/faqs" },
            ].map((item) => (
              <Link key={item.name} to={item.link} className="text-[#545252] font-light hover:text-purple-500 transition">
                {item.name}
              </Link>
            ))}

            {/* Product Dropdown */}
            <div className="relative">
              <button onClick={() => setProductOpen(!productOpen)} className="flex items-center text-[#545252] font-light hover:text-purple-500 transition">
                Product <ChevronDownIcon className="h-4 w-4 ml-1" />
              </button>
              {productOpen && (
                <div className="absolute mt-4 w-80 bg-white rounded-lg p-4 cursor-pointer">
                  <h4 className="text-gray-500 text-xs uppercase mb-2">Products</h4>
                  <div className="space-y-2">
                    <Link to="/products" className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-100 transition">
                      <img src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741727773/AoStyle/image_jmwiuo.jpg" alt="OA Styles" className="h-12 w-12 rounded-md" />
                      <div>
                        <p className="text-gray-800 font-semibold">OA Styles</p>
                        <p className="text-gray-500 text-sm">For tailoring services of all sorts.</p>
                      </div>
                      <ArrowRightIcon className="h-5 w-5 text-purple-500 ml-auto" />
                    </Link>
                    <Link to="/marketplace" className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-100 transition">
                      <img src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741727765/AoStyle/Group_1321315093_la6kma.jpg" alt="Marketplace" className="h-12 w-12 rounded-md" />
                      <div>
                        <p className="text-gray-800 font-semibold">Marketplace</p>
                        <p className="text-gray-500 text-sm">Find all sorts of fabrics and materials.</p>
                      </div>
                      <ArrowRightIcon className="h-5 w-5 text-purple-500 ml-auto" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
            {/* Careers Dropdown */}
            <div className="relative" ref={careersRef}>
              <button
                className="flex items-center text-[#545252] font-light hover:text-purple-500 transition"
                onClick={() => setCareersOpen(!careersOpen)}
              >
                Careers <ChevronDownIcon className="h-4 w-4 ml-1" />
              </button>
              {careersOpen && (
                <div className="absolute left-0 mt-2 bg-white shadow-lg rounded-md w-56">
                  <a href="#" className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100">
                    <UsersIcon className="h-5 w-5 text-purple-600 mr-2" />
                    Become A Sales Rep
                  </a>
                  <a href="#" className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100">
                    <BriefcaseIcon className="h-5 w-5 text-purple-600 mr-2" />
                    See All Jobs
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Right Icons */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <div className="relative" ref={searchRef}>
              {searchOpen ? (
                <input
                  type="text"
                  className="border border-gray-100 rounded-sm px-3 py-1 w-48 focus:outline-none focus:ring-1 transition-all"
                  placeholder="Search..."
                  autoFocus
                />
              ) : (
                <MagnifyingGlassIcon
                  className="h-5 w-5 text-gray-800 cursor-pointer"
                  onClick={() => setSearchOpen(true)}
                />
              )}
            </div>
            <ShoppingCartIcon className="h-5 w-5 text-gray-800 cursor-pointer" />
            <div className="flex items-center space-x-1 cursor-pointer">
              <UserIcon className="h-5 w-5 text-gray-800" />
              <Link to="/login" className="text-gray-800">Login</Link>
            </div>
            <Link to="/sign-up" className="bg-gradient text-white px-5 lg:px-6 py-2 lg:py-3 hover:bg-purple-600 transition">
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <XMarkIcon className="h-6 w-6 text-gray-800" /> : <Bars3Icon className="h-6 w-6 text-gray-800" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Flyout */}
      <div
        ref={menuRef}
        className={`fixed inset-y-0 right-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-6">
          <button className="absolute top-4 right-4" onClick={() => setIsOpen(false)}>
            <XMarkIcon className="h-6 w-6 text-gray-800" />
          </button>
          <div className="flex flex-col space-y-4">
          {[{ name: "Home", link: "/" },
            { name: "About", link: "/about" },
            { name: "FAQs", link: "/faqs" },
            ].map((item) => (
              <Link key={item.name} to={item.link} className="text-[#545252] font-light hover:text-purple-500 transition">
                {item.name}
              </Link>
            ))}
            {/* Product Dropdown for Mobile */}
            <button className="text-[#545252]  hover:text-purple-500 flex justify-between" onClick={() => setMobileProductOpen(!mobileProductOpen)}>
              Product <ChevronDownIcon className="h-4 w-4" />
            </button>
            {mobileProductOpen && (
              <div className="bg-white rounded-md mt-2">
                <Link to="/products/type1" className="block px-4 py-2 text-[#545252] font-light hover:bg-gray-100">Product Type 1</Link>
                <Link to="/products/type2" className="block px-4 py-2 text-[#545252] font-light hover:bg-gray-100">Product Type 2</Link>
              </div>
            )}
            {/* Careers Dropdown for Mobile */}
            <div className="relative">
              <button
                className="flex items-center justify-between w-full text-[#545252] font-light hover:text-purple-500 transition py-2"
                onClick={() => setMobileCareersOpen(!mobileCareersOpen)}
              >
                Careers <ChevronDownIcon className="h-4 w-4" />
              </button>
              {mobileCareersOpen && (
                <div className="bg-white rounded-md mt-2">
                  <a href="#" className="flex items-center px-4 py-2 text-[#545252] font-light hover:bg-gray-100">
                    <UsersIcon className="h-5 w-5 text-purple-600 mr-2" />
                    Become A Sales Rep
                  </a>
                  <a href="#" className="flex items-center px-4 py-2 text-[#545252] font-light hover:bg-gray-100">
                    <BriefcaseIcon className="h-5 w-5 text-purple-600 mr-2" />
                    See All Jobs
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="flex flex-col space-y-4 mt-6">
            <div className="flex justify-start space-x-4">
              <MagnifyingGlassIcon className="h-6 w-6 text-gray-800 cursor-pointer" />
              <ShoppingCartIcon className="h-6 w-6 text-gray-800 cursor-pointer" />
              <div className="flex items-center space-x-1 cursor-pointer">
                <UserIcon className="h-6 w-6 text-gray-800" />
                <span className="text-gray-800">Login</span>
              </div>
            </div>
            <button className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
