import Inject from "./Inject";
import { useState, useRef, useEffect } from "react";
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";
import {
  Bars3Icon,
  XMarkIcon,
  ShoppingCartIcon,
  UserIcon,
  ChevronDownIcon,
  BriefcaseIcon,
  UsersIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import useGetCart from "../../hooks/cart/useGetCart";
import { useCarybinUserStore } from "../../store/carybinUserStore";
import useToast from "../../hooks/useToast";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const [mobileCareersOpen, setMobileCareersOpen] = useState(false);
  const [mobileProductOpen, setMobileProductOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };


  return (
    <div>
      <nav className="fixed w-full z-[95] py-3 backdrop-blur-md bg-white/80 border-b border-white/20 shadow-lg shadow-purple-500/5">
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
            <div className="hidden lg:flex flex-grow justify-left space-x-5 lg:space-x-6 xl:space-x-8 cursor-pointer items-center">
              {[
                { name: "Home", link: "/" },
                { name: "About", link: "/about" },
                { name: "FAQs", link: "/faqs" },
              ].map((item) => (
                <Link
                  key={item.name}
                  to={item.link}
                  className="text-[#545252] text-base font-medium hover:text-purple-600 transition-colors duration-200 relative group"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
              <Inject />

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
                <div className={`relative flex items-center backdrop-blur-sm bg-white/90 border transition-all duration-300 rounded-full ${isSearchFocused
                    ? "border-purple-500/80 shadow-lg shadow-purple-200/50 ring-2 ring-purple-200/30"
                    : "border-gray-200/50 shadow-sm hover:border-purple-300/60 hover:shadow-md"
                  }`}>
                  <div className="absolute left-4 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className={`h-5 w-5 transition-colors duration-300 ${isSearchFocused ? "text-purple-600" : "text-gray-400"
                      }`} />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    placeholder="Search items"
                    className="w-full py-3 pl-12 pr-14 bg-transparent text-gray-900 placeholder-gray-400 border-0 rounded-full focus:outline-none focus:ring-0"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-12 p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={!searchQuery.trim()}
                    className={`absolute right-2 p-2.5 rounded-full transition-all duration-300 ${searchQuery.trim()
                        ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-md hover:shadow-lg transform hover:scale-110 active:scale-95"
                        : "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md hover:shadow-lg cursor-not-allowed"
                      }`}
                    title="Search"
                  >
                    <MagnifyingGlassIcon className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </div>

            {/* Right Icons */}
            <div className="hidden lg:flex items-center space-x-4 lg:space-x-6">
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
                      className={`h-4 w-4 text-purple-500 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""
                        }`}
                    />

                    {/* Enhanced Dropdown */}
                    {isDropdownOpen && (
                      <div className="absolute right-0 top-14 w-56 bg-white shadow-2xl rounded-xl border border-purple-100 z-50 overflow-hidden transform transition-all duration-300 ease-out opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]">
                        {/* Header */}
                        <div className="px-4 py-3 bg-gradient-to-r from-purple-50 via-purple-50 to-purple-100 border-b border-purple-100">
                          <p className="text-xs text-purple-600 font-medium uppercase tracking-wide">
                            Welcome back,
                          </p>
                          <p className="text-sm font-semibold text-purple-800 truncate mt-0.5">
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
                            <div className="flex items-center px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 cursor-pointer transition-all duration-200 group">
                              <div className="p-2 bg-purple-100 rounded-lg mr-3 group-hover:bg-purple-200 group-hover:scale-110 transition-all duration-200">
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
                              <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700 transition-colors">
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
                            className="flex items-center w-full px-4 py-3 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 cursor-pointer transition-all duration-200 group"
                          >
                            <div className="p-2 bg-red-100 rounded-lg mr-3 group-hover:bg-red-200 group-hover:scale-110 transition-all duration-200">
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
                            <span className="text-sm font-medium text-red-600 group-hover:text-red-700 transition-colors">
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
                    className="relative bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 lg:px-8 py-2.5 lg:py-3 rounded-full font-semibold text-sm shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden group whitespace-nowrap"
                  >
                    <span className="relative z-10">Get Started</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Icons: Search, Cart, and Menu Button */}
            <div className="flex lg:hidden items-center space-x-3">
              {/* Mobile Search Toggle */}
              <button
                onClick={() => setIsSearchFocused(!isSearchFocused)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <MagnifyingGlassIcon className="h-6 w-6 text-gray-800" />
              </button>

              {/* Mobile Cart Icon */}
              <Link to={`/view-cart`} className="relative p-2">
                <ShoppingCartIcon className="h-6 w-6 text-gray-800" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Hamburger Menu Button */}
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

        {/* Mobile Search Bar Overlay */}
        {isSearchFocused && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg z-50 p-4 animate-[slideDown_0.3s_ease-out]">
            <form onSubmit={(e) => { handleSearch(e); setIsSearchFocused(false); }} className="w-full">
              <div className="relative flex items-center bg-white border border-purple-300 rounded-full shadow-md">
                <div className="absolute left-4 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-purple-600" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search items..."
                  autoFocus
                  className="w-full py-3 pl-12 pr-14 bg-transparent text-gray-900 placeholder-gray-400 border-0 rounded-full focus:outline-none focus:ring-0"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-12 p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!searchQuery.trim()}
                  className={`absolute right-2 p-2.5 rounded-full transition-all duration-300 ${searchQuery.trim()
                      ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-md"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </button>
              </div>
            </form>
            <button
              onClick={() => setIsSearchFocused(false)}
              className="mt-2 text-sm text-gray-600 hover:text-purple-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Mobile Menu - Flyout */}
        {isOpen && (
          <div
            ref={menuRef}
            className="fixed inset-y-0 right-0 w-74 bg-white border-l border-gray-200 shadow-2xl transform transition-transform duration-300 ease-in-out translate-x-0 z-[96]"
            style={{ backgroundColor: '#ffffff' }}
            onMouseLeave={() => setIsOpen(false)}
          >
            <div className="p-6 bg-white">
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
                        carybinUser?.profile?.profile_picture
                      }
                      alt={(carybinUser?.name?.split(" ")[0] || "User").slice(0, 2).toUpperCase()}
                      className="w-8 h-8 rounded-full border-2 border-purple-400 object-cover justify-center items-center flex bg-purple-100 text-purple-600 font-semibold text-sm"
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
                      className={`h-4 w-4 text-purple-500 ml-auto transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""
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
                    className="relative bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-full font-semibold text-sm shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden group whitespace-nowrap"
                  >
                    <span className="relative z-10">Get Started</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
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
