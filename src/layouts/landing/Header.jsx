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
  const [mobileCareersOpen, setMobileCareersOpen] = useState(false);
  const [mobileProductOpen, setMobileProductOpen] = useState(false);
  const searchRef = useRef(null);
  const menuRef = useRef(null);
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
    <nav className="bg-white fixed w-full z-[95] py-3">
      <div className="Resizer">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 pr-3 lg:pr-5 xl:pr-20">
            <Link to="/">
              <img
                src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1742964300/AoStyle/CARYBIN_TRANSPARENT_1_ujbdei.png"
                alt="OA Styles"
                className="h-16 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-grow justify-left space-x-4 lg:space-x-6 xl:space-x-8 cursor-pointer">
            {[{ name: "Home", link: "/" },
            { name: "About", link: "/about" },
            { name: "FAQs", link: "/faqs" },
            ].map((item) => (
              <Link key={item.name} to={item.link} className="text-[#545252] text-base font-light hover:text-purple-500 transition">
                {item.name}
              </Link>
            ))}

            {/* Product Dropdown */}
            <div
              className="relative"
              ref={productRef}
              onMouseEnter={() => setProductOpen(true)}
              onMouseLeave={() => setProductOpen(false)}
            >
              <button className="flex items-center text-[#545252] font-light hover:text-purple-500 transition">
                Product <ChevronDownIcon className="h-4 w-4 ml-1" />
              </button>
              {productOpen && (
                <div className="absolute mt-2 w-80 bg-white rounded-lg p-4 shadow-lg">
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
              onMouseEnter={() => setCareersOpen(true)}
              onMouseLeave={() => setCareersOpen(false)}
            >
              <button className="flex items-center text-[#545252] font-light hover:text-purple-500 transition">
                Careers <ChevronDownIcon className="h-4 w-4 ml-1" />
              </button>
              {careersOpen && (
                <div className="absolute left-0 mt-2 bg-white shadow-lg p-4 rounded-md w-66">
                  <a
                    href="#"
                    className="flex items-center px-4 py-3 text-gray-800 hover:bg-gray-100"
                  >
                    <UsersIcon className="h-6 w-6 text-purple-600 mr-4" />
                    Become A Market Rep
                  </a>
                  <a
                    href="#"
                    className="flex items-center px-4 py-3 text-gray-800 hover:bg-gray-100"
                  >
                    <BriefcaseIcon className="h-6 w-6 text-purple-600 mr-4" />
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
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md bg-gradient"
            >
              {isOpen ? (
                <XMarkIcon className="h-7 w-7 text-white" />
              ) : (
                <Bars3Icon className="h-7 w-7 text-white" />
              )}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Menu - Flyout */}
      <div
        ref={menuRef}
        className={`fixed inset-y-0 right-0 w-74 bg-white transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        onMouseLeave={() => setIsOpen(false)}
      >
        <div className="p-6">
          <button className="absolute top-4 right-4" onClick={() => setIsOpen(false)}>
            <XMarkIcon className="h-6 w-6 text-gray-800" />
          </button>
          <div className="flex flex-col space-y-6 mt-6">
            {[{ name: "Home", link: "/" },
            { name: "About", link: "/about" },
            { name: "FAQs", link: "/faqs" },
            ].map((item) => (
              <Link key={item.name} to={item.link} className="text-[#545252] font-light hover:text-purple-500 transition"
                onClick={() => setIsOpen(false)} >
                {item.name}
              </Link>
            ))}
            {/* Product Dropdown for Mobile */}
            <button className="text-[#545252]  hover:text-purple-500 flex justify-between" onClick={() => setMobileProductOpen(!mobileProductOpen)}>
              Product <ChevronDownIcon className="h-4 w-4" />
            </button>
            {mobileProductOpen && (
              <div className="bg-white rounded-md mt-2">
                <div className="space-y-2">
                  <Link to="/products" className="flex items-center p-3 rounded-lg hover:bg-gray-100" onClick={() => setIsOpen(false)}>
                    <img src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741727773/AoStyle/image_jmwiuo.jpg" alt="OA Styles" className="h-10 w-10 rounded-md" />
                    <p className="ml-4">OA Styles - Tailoring Services</p>
                    <ArrowRightIcon className="h-6 w-6 text-purple-500 ml-auto" />
                  </Link>
                  <Link to="/marketplace" className="flex items-center p-3 rounded-lg hover:bg-gray-100" onClick={() => setIsOpen(false)}>
                    <img src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741727765/AoStyle/Group_1321315093_la6kma.jpg" alt="Marketplace" className="h-10 w-10 rounded-md" />
                    <p className="ml-4">Marketplace - Buy Fabrics</p>
                    <ArrowRightIcon className="h-6 w-6 text-purple-500 ml-auto" />
                  </Link>
                </div>
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
                <div className="bg-white rounded-md mt-2" onClick={() => setIsOpen(false)}>
                  <a href="#" className="flex items-center px-4 py-2 text-[#545252] font-light hover:bg-gray-100">
                    <UsersIcon className="h-5 w-5 text-purple-600 mr-4" />
                    Become A Market Rep
                  </a>
                  <a href="#" className="flex items-center px-4 py-2 text-[#545252] font-light hover:bg-gray-100">
                    <BriefcaseIcon className="h-5 w-5 text-purple-600 mr-4" />
                    See All Jobs
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="flex flex-col space-y-6 mt-6">
            <div className="flex justify-start space-x-4">
              <MagnifyingGlassIcon className="h-5 w-5 text-[#545252] cursor-pointer md:hidden hidden" />
              <ShoppingCartIcon className="h-5 w-5 text-[#545252] cursor-pointer" />
              <div className="flex items-center space-x-1 cursor-pointer">
                <UserIcon className="h-5 w-5 text-[#545252]" />
                <Link to="/login" className="text-gray-800">Login</Link>
              </div>
            </div>
            <Link to="/sign-up" className="bg-gradient text-white px-5 rounded-md lg:px-6 py-2 lg:py-3 hover:bg-purple-600 transition">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
