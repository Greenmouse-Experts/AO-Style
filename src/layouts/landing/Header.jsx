import Inject from "./Inject";
import { useState, useRef, useEffect } from "react";
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
import { useCarybinUserStore } from "../../store/carybinUserStore";
import useToast from "../../hooks/useToast";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileCareersOpen, setMobileCareersOpen] = useState(false);
  const [mobileProductOpen, setMobileProductOpen] = useState(false);
  const searchRef = useRef(null);
  const menuRef = useRef(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [localStorageCartCount, setLocalStorageCartCount] = useState(0);

  const { carybinUser, logOut } = useCarybinUserStore();

  const { toastSuccess } = useToast();

  const token = Cookies.get("token");

  const currUrl = Cookies.get("currUserUrl");

  const { data: cartResponse, isPending } = useGetCart();

  // Get cart data from API response (when user is logged in)
  const cartData = cartResponse?.data;
  const items = cartData?.items || [];
  const apiCartCount = items.length;

  // Function to get localStorage cart count
  const getLocalStorageCartCount = () => {
    try {
      const pendingFabricData = localStorage.getItem("pending_fabric_data");
      if (pendingFabricData) {
        const parsedData = JSON.parse(pendingFabricData);
        return parsedData.items ? parsedData.items.length : 0;
      }
      return 0;
    } catch (error) {
      console.error("Error parsing localStorage cart data:", error);
      return 0;
    }
  };

  // Update localStorage cart count when component mounts or when localStorage changes
  useEffect(() => {
    if (!token) {
      const count = getLocalStorageCartCount();
      setLocalStorageCartCount(count);
    }
  }, [token]);

  // Listen for localStorage changes and poll for updates
  useEffect(() => {
    if (!token) {
      const handleStorageChange = () => {
        const count = getLocalStorageCartCount();
        setLocalStorageCartCount(count);
      };

      // Listen for storage events (cross-tab)
      window.addEventListener("storage", handleStorageChange);

      // Custom event for same-tab localStorage updates
      window.addEventListener("localStorageCartUpdate", handleStorageChange);

      // Poll for localStorage changes every 500ms when no token (for immediate updates)
      const pollInterval = setInterval(() => {
        const currentCount = getLocalStorageCartCount();
        setLocalStorageCartCount((prevCount) => {
          if (prevCount !== currentCount) {
            return currentCount;
          }
          return prevCount;
        });
      }, 500);

      return () => {
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener(
          "localStorageCartUpdate",
          handleStorageChange,
        );
        clearInterval(pollInterval);
      };
    }
  }, [token]);

  // Determine which cart count to use
  const cartCount = token ? apiCartCount : localStorageCartCount;

  console.log(
    "🛒 Header Cart Count:",
    cartCount,
    token ? "API Items:" : "LocalStorage Items:",
    token ? items : "localStorage",
  );

  const handleSignOut = () => {
    toastSuccess("Logout Successfully");
    logOut();
    window.location.href = "/login";
    Cookies.remove("token");
    setIsAddModalOpen(false);
    localStorage.setItem("logout", Date.now().toString());
  };

  return (
    <div>
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
            <div className="hidden lg:flex flex-grow justify-left space-x-4 lg:space-x-6 xl:space-x-8 cursor-pointer">
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
            <div className="hidden lg:flex items-center space-x-4 lg:space-x-6">
              {/* <div className="relative" ref={searchRef}>
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
            </div> */}
              <Link to={`/view-cart`} className="transition relative">
                <ShoppingCartIcon className="h-5 w-5 text-gray-800 cursor-pointer" />
                {cartCount > 0 ? (
                  <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                ) : (
                  <></>
                )}
              </Link>

              {token && currUrl && carybinUser ? (
                <>
                  <div
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 cursor-pointer relative px-3 py-2 rounded-lg hover:bg-white transition-all duration-200 bg-purple-50 shadow-md"
                  >
                    <div className="p-1.5 bg-purple-100 rounded-full">
                      <UserIcon className="h-4 w-4 text-purple-600" />
                    </div>
                    <p className="text-sm font-medium text-purple-700 transition">
                      {carybinUser?.name}
                    </p>
                    <ChevronDownIcon
                      className={`h-4 w-4 text-purple-500 transition-transform duration-200 ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    />

                    {/* Enhanced Dropdown */}
                    {isDropdownOpen && (
                      <div className="absolute right-0 top-12 w-48 bg-white shadow-xl rounded-xl border border-purple-100 z-50 animate-fade-in overflow-hidden">
                        {/* Header */}
                        <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-100">
                          <p className="text-xs text-purple-600 font-medium">
                            Welcome back,
                          </p>
                          <p className="text-sm font-semibold text-purple-800 truncate">
                            {carybinUser?.name}
                          </p>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          <Link
                            onClick={() => {
                              setIsDropdownOpen(false);
                              setIsOpen(false);
                            }}
                            to={`/${currUrl}`}
                          >
                            <div className="flex items-center px-4 py-3 hover:bg-purple-50 cursor-pointer transition-all duration-150 group">
                              <div className="p-1.5 bg-purple-100 rounded-lg mr-3 group-hover:bg-purple-200 transition-colors">
                                <svg
                                  className="h-4 w-4 text-purple-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                              </div>
                              <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">
                                My Account
                              </span>
                            </div>
                          </Link>

                          <div className="border-t border-gray-100 my-1"></div>

                          <button
                            onClick={() => {
                              setIsAddModalOpen(true);
                              setIsDropdownOpen(false);
                              setIsOpen(false);
                            }}
                            className="flex items-center w-full px-4 py-3 hover:bg-red-50 cursor-pointer transition-all duration-150 group"
                          >
                            <div className="p-1.5 bg-red-100 rounded-lg mr-3 group-hover:bg-red-200 transition-colors">
                              <svg
                                className="h-4 w-4 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                              </svg>
                            </div>
                            <span className="text-sm font-medium text-red-600">
                              Logout
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex  items-center space-x-1 cursor-pointer">
                    <UserIcon className="h-5 w-5 text-purple-500 " />
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
            <div className="lg:hidden">
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
                  className="text-[#545252] hover:text-purple-500 flex justify-between"
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
                      {!(token && currUrl && carybinUser) && (
                        <Link
                          to="/sign-in-as-market-rep"
                          className="flex items-center px-4 py-4 text-gray-800 hover:bg-gray-100"
                        >
                          <BriefcaseIcon className="h-6 w-6 text-purple-600 mr-4" />
                          Become A Market Rep
                        </Link>
                      )}
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
                  <Link to={`/view-cart`} className="transition relative">
                    <ShoppingCartIcon className="h-5 w-5 text-[#545252] cursor-pointer" />
                    {cartCount > 0 ? (
                      <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                        {cartCount}
                      </span>
                    ) : (
                      <></>
                    )}
                  </Link>

                  {token && currUrl && carybinUser ? (
                    <></>
                  ) : (
                    <div className="flex items-center space-x-1 cursor-pointer">
                      <UserIcon className="h-5 w-5 text-[#545252]" />
                      <Link to="/login" className="text-gray-800">
                        Login
                      </Link>
                    </div>
                  )}
                </div>
                {token && currUrl ? (
                  <div
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex bg-white shadow-md p-2 rounded-lg items-center gap-3 cursor-pointer hover:bg-purple-50 transition duration-200 relative"
                    title="View profile"
                  >
                    <img
                      src={
                        carybinUser?.profile?.profile_picture ||
                        "https://ui-avatars.com/api/?name=User&background=eee&color=888"
                      }
                      alt="User"
                      className="w-8 h-8 rounded-full border-2 border-purple-400 object-cover"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-purple-700">
                        {carybinUser?.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        View profile
                      </span>
                    </div>
                    <ChevronDownIcon
                      className={`h-4 w-4 text-purple-500 ml-auto transition-transform duration-200 ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                    {/* Enhanced Dropdown */}
                    {isDropdownOpen && (
                      <div className="absolute bottom-12 left-0 w-40 bg-white shadow-lg rounded-lg z-50 animate-fade-in">
                        <ul className="py-2">
                          <Link
                            onClick={() => setIsDropdownOpen(false)}
                            to={`/${currUrl}`}
                          >
                            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-150">
                              My Account
                            </li>
                          </Link>
                          <button
                            onClick={() => {
                              setIsAddModalOpen(true);
                              setIsDropdownOpen(false);
                            }}
                            className="px-4 py-2 hover:bg-gray-100 text-red-500 cursor-pointer w-full text-left transition-colors duration-150"
                          >
                            Logout
                          </button>
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to="/sign-up"
                    className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-6 py-2 rounded-lg font-semibold shadow hover:scale-105 hover:bg-purple-600 transition"
                  >
                    Get Started
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Commented out old dropdown for clarity */}
        {/*
        {isDropdownOpen && (
          <div className="absolute right-4 mt-2 w-36 bg-white shadow-lg rounded-lg z-50">
            <ul className="py-2">
              <Link
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                to={`/${currUrl}`}
              >
                <li className="px-4  py-2 hover:bg-gray-100 cursor-pointer">
                  My Account
                </li>
              </Link>
              <button
                onClick={() => {
                  setIsAddModalOpen(true);
                  setIsDropdownOpen(!isDropdownOpen);
                }}
                className="px-4 py-2 hover:bg-gray-100 text-red-500 cursor-pointer"
              >
                Logout
              </button>
            </ul>
          </div>
        )}
        */}
      </nav>
      {isAddModalOpen && (
        <div
          className="fixed inset-0 flex justify-center items-center z-[999] backdrop-blur-sm"
          onClick={() => {
            setIsAddModalOpen(false);
          }}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Log out</h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                }}
                className="text-gray-500 cursor-pointer hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[80vh] overflow-y-auto px-1">
              {" "}
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Are you sure you want to logout
              </label>
              <div className="flex justify-between mt-6 space-x-4">
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                  }}
                  className="w-full cursor-pointer bg-purple-400 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleSignOut();
                  }}
                  className="w-full cursor-pointer bg-gradient text-white px-4 py-4 rounded-md text-sm font-medium"
                >
                  {"Logout"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
