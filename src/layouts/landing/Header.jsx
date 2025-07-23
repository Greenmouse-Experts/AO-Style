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
import { useCartStore } from "../../store/carybinUserCartStore";
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

  const { carybinUser, logOut } = useCarybinUserStore();

  const { toastSuccess } = useToast();

  const token = Cookies.get("token");

  const currUrl = Cookies.get("currUserUrl");

  const { data: cartData, isPending } = useGetCart();

  const items = useCartStore((state) => state.items);

  const totalProductQuantity = items?.reduce(
    (total, item) => total + (item?.product?.quantity || 0),
    0
  );

  const totalStyleQuantity = items?.reduce(
    (total, item) => total + (item?.product?.style?.measurement?.length || 0),
    0
  );

  const totalQuantity = totalProductQuantity + totalStyleQuantity;

  const handleSignOut = () => {
    toastSuccess("Logout Successfully");
    logOut();
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
                {items?.length > 0 ? (
                  <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {items?.length}
                  </span>
                ) : (
                  <></>
                )}
              </Link>

              {token && currUrl && carybinUser ? (
                <>
                  {/* <Link
                  to={`/${currUrl}`}
                  className="bg-gradient text-white px-5 lg:px-6 py-2 lg:py-3 hover:bg-purple-600 transition"
                >
                  Dashboard
                </Link> */}
                  <div
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-1 cursor-pointer"
                  >
                    <UserIcon className="h-5 w-5 text-gray-800" />
                    <p className="text-xs font-light text-purple-500 transition">
                      {carybinUser?.name}
                    </p>
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
                  <Link to={`/view-cart`} className="transition relative">
                    <ShoppingCartIcon className="h-5 w-5 text-[#545252] cursor-pointer" />
                    {totalQuantity > 0 ? (
                      <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                        {totalQuantity}
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
                    className="flex bg-gray-100 p-2 rounded items-center gap-3 cursor-pointer"
                  >
                    <img
                      src={carybinUser?.profile?.profile_picture}
                      alt="User"
                      className="w-8 h-8 rounded-full cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <p className="text-sm text-[#545252] transition">
                        {carybinUser.name}
                      </p>
                      <p className="text-gray-500 text-[10px]">View profile</p>
                    </div>
                  </div>
                ) : (
                  <Link
                    to="/sign-up"
                    className="bg-gradient text-white px-5 rounded-md lg:px-6 py-2 lg:py-3 hover:bg-purple-600 transition"
                  >
                    Get Started
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
        {isDropdownOpen && (
          <div className="absolute right-4 mt-2 w-36 bg-white shadow-lg rounded-lg z-50">
            <ul className="py-2">
              {/* <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  Profile
                </li> */}
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
      </nav>
      {isAddModalOpen && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm"
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
