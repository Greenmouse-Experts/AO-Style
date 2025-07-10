import Inject from "./Inject";
import { useState, useRef } from "react";
import Cookies from "js-cookie";
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
import useGetCart from "../../hooks/cart/useGetCart";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileCareersOpen, setMobileCareersOpen] = useState(false);
  const [mobileProductOpen, setMobileProductOpen] = useState(false);
  const searchRef = useRef(null);
  const menuRef = useRef(null);

  const token = Cookies.get("token");

  const currUrl = Cookies.get("currUserUrl");

  const { data: cartData, isPending } = useGetCart();

  const totalQuantity = cartData?.data?.items?.reduce(
    (total, item) => total + item.quantity,
    0
  );

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
            {[
              { name: "Home", link: "/" },
              { name: "About", link: "/about" },
              { name: "FAQs", link: "/faqs" },
            ].map((item) => (
              <Link
                key={item.name}
                to={item.link}
                className="text-[#545252] text-base font-light hover:text-purple-500 transition"
              >
                {item.name}
              </Link>
            ))}
            <Inject />
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
            <Link to={`/view-cart`} className="transition relative">
              <ShoppingCartIcon className="h-5 w-5 text-gray-800 cursor-pointer" />
              <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {totalQuantity}
              </span>
            </Link>

            {token && currUrl ? (
              <Link
                to={`/${currUrl}`}
                className="bg-gradient text-white px-5 lg:px-6 py-2 lg:py-3 hover:bg-purple-600 transition"
              >
                Dashboard
              </Link>
            ) : (
              <>
                {" "}
                <div className="flex items-center space-x-1 cursor-pointer">
                  <UserIcon className="h-5 w-5 text-gray-800" />
                  <Link to="/login" className="text-gray-800">
                    Login
                  </Link>
                </div>
                <Link
                  to="/sign-up"
                  className="bg-gradient text-white px-5 lg:px-6 py-2 lg:py-3 hover:bg-purple-600 transition"
                >
                  Get Started
                </Link>
              </>
            )}
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
      {isOpen && (
        <div
          ref={menuRef}
          className="fixed inset-y-0 right-0 w-74 bg-white transform transition-transform duration-300 ease-in-out translate-x-0"
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="p-6">
            <button
              className="absolute top-4 right-4"
              onClick={() => setIsOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-gray-800" />
            </button>
            <div className="flex flex-col space-y-6 mt-6">
              {[
                { name: "Home", link: "/" },
                { name: "About", link: "/about" },
                { name: "FAQs", link: "/faqs" },
              ].map((item) => (
                <Link
                  key={item.name}
                  to={item.link}
                  className="text-[#545252] font-light hover:text-purple-500 transition"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {/* Product Dropdown for Mobile */}
              <button
                className="text-[#545252]  hover:text-purple-500 flex justify-between"
                onClick={() => setMobileProductOpen(!mobileProductOpen)}
              >
                Product <ChevronDownIcon className="h-4 w-4" />
              </button>
              {mobileProductOpen && (
                <div className="bg-white rounded-md mt-2">
                  <div className="space-y-2">
                    <Link
                      to="/products"
                      className="flex items-center p-3 rounded-lg hover:bg-gray-100"
                      onClick={() => setIsOpen(false)}
                    >
                      <img
                        src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741727773/AoStyle/image_jmwiuo.jpg"
                        alt="OA Styles"
                        className="h-10 w-10 rounded-md"
                      />
                      <p className="ml-4">OA Styles - Tailoring Services</p>
                      <ArrowRightIcon className="h-6 w-6 text-purple-500 ml-auto" />
                    </Link>
                    <Link
                      to="/marketplace"
                      className="flex items-center p-3 rounded-lg hover:bg-gray-100"
                      onClick={() => setIsOpen(false)}
                    >
                      <img
                        src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741727765/AoStyle/Group_1321315093_la6kma.jpg"
                        alt="Marketplace"
                        className="h-10 w-10 rounded-md"
                      />
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
                  <div
                    className="bg-white rounded-md mt-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <Link
                      to="/sign-in-as-market-rep"
                      className="flex items-center px-4 py-4 text-gray-800 hover:bg-gray-100"
                    >
                      <BriefcaseIcon className="h-6 w-6 text-purple-600 mr-4" />
                      Become A Market Rep
                    </Link>
                    <Link
                      to="/jobs"
                      className="flex items-center px-4 py-4 text-gray-800 hover:bg-gray-100"
                    >
                      <UsersIcon className="h-6 w-6 text-purple-600 mr-4" />
                      See All Jobs
                    </Link>
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
                  <Link to="/login" className="text-gray-800">
                    Login
                  </Link>
                </div>
              </div>
              <Link
                to="/sign-up"
                className="bg-gradient text-white px-5 rounded-md lg:px-6 py-2 lg:py-3 hover:bg-purple-600 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
