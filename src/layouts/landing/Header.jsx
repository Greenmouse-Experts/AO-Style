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
} from "@heroicons/react/24/outline";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [careersOpen, setCareersOpen] = useState(false);
  const [mobileCareersOpen, setMobileCareersOpen] = useState(false);
  const searchRef = useRef(null);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
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
                src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741185293/AoStyle/Vector_biigue.png"
                alt="OA Styles"
                className="h-12 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-grow justify-left space-x-4 lg:space-x-6 xl:space-x-12">
            {[
              { name: "Home", link: "/" },
              { name: "About", link: "/about" },
              { name: "Shop", link: "/shop" },
              { name: "Marketplace", link: "/marketplace" },
              { name: "FAQs", link: "/faqs" },
            ].map((item) => (
              <Link key={item.name} to={item.link} className="text-gray-800 hover:text-purple-500 transition">
                {item.name}
              </Link>
            ))}

            {/* Careers with Dropdown */}
            <div className="relative">
              <button
                className="flex items-center text-gray-800 hover:text-purple-500 transition"
                onClick={() => setCareersOpen(!careersOpen)}
              >
                Careers <ChevronDownIcon className="h-4 w-4 ml-1" />
              </button>
              {careersOpen && (
                <div className="absolute mt-4 w-52 bg-white rounded-md">
                  <Link to="/careers/sales-rep" className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100">
                    <UsersIcon className="h-5 w-5 text-purple-600 mr-2" />
                    Become A Sales Rep
                  </Link>
                  <Link to="/careers/jobs" className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100">
                    <BriefcaseIcon className="h-5 w-5 text-purple-600 mr-2" />
                    See All Jobs
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Icons & Search */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-800 cursor-pointer" />
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
    </nav>
  );
}
