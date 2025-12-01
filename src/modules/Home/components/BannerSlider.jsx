import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

const slides = [
  {
    id: 1,
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741332601/AoStyle/Frame_1618873277_gzl5cm.jpg",
    heading:
      "A virtual marketplace that offers high-quality fabrics, bespoke tailoring services and seamless door delivery to customers in time.",
    buttonText: "Shop Now",
    buttonLink: "/marketplace",
  },
  {
    id: 2,
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741204138/AoStyle/image2_vx85sg.jpg",
    heading:
      "Connecting customers to <span class='font-bold italic'>Fashion Designers</span>",
    description:
      "Welcome to Carybin, a platform that simplifies tailoring processes; from buying materials to finding a tailor for you.",
    buttonText: "Shop Now",
    buttonLink: "/shop",
  },
  {
    id: 3,
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214080/AoStyle/image_idfv3e.jpg",
    heading:
      "Connecting customers to <span class='font-bold italic'>Fabric Vendors</span>",
    description:
      "Find the best fashion trends and designs from top designers around the world. Get inspired and shop effortlessly.",
    buttonText: "Explore Now",
    buttonLink: "/sign-up",
  },
  {
    id: 4,
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1744870895/Group_1321315150_rvdrzb.jpg",
    heading:
      "Get your order to your doorstep - <span class='font-bold italic'> In time !</span>",
    description:
      "Get custom-made outfits designed to match your unique style and preferences, delivered right to your doorstep.",
    buttonText: "Get Started",
    buttonLink: "/sign-up",
  },
];

export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsSearchFocused(false);
    }
  };

  return (
    <div className="relative w-full h-[650px] md:h-[650px] overflow-hidden">
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-500"
        style={{
          backgroundImage: `url(${slides[index].image})`,
          opacity: 1,
          transition: "background-image 0.5s ease-in-out",
        }}
      />

      <div className="absolute inset-0 flex flex-col justify-center items-start text-left bg-opacity-40 text-white Resizer">
        <motion.div
          className="mb-4 px-4 py-2 border border-white font-extralight rounded-full text-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          One Stop Shop
        </motion.div>
        <motion.h1
          key={`heading-${index}`}
          className="text-2xl md:text-3xl font-medium leading-relaxed max-w-[750px]"
          dangerouslySetInnerHTML={{ __html: slides[index].heading }}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
        <motion.p
          key={`desc-${index}`}
          className="mt-3 text-base font-light leading-loose max-w-lg"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {slides[index].description}
        </motion.p>
        <div className="mt-6 flex items-center gap-6 flex-wrap">
          <Link to={slides[index].buttonLink}>
            <motion.button
              key={`button-${index}`}
              className="px-8 py-3 bg-white text-purple-600 font-normal rounded-md hover:bg-gray-200 cursor-pointer transition"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {slides[index].buttonText}
            </motion.button>
          </Link>

          {/* Trusted Users Section */}
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              <img
                src="https://randomuser.me/api/portraits/women/1.jpg"
                className="w-8 h-8 rounded-full border border-white"
              />
              <img
                src="https://randomuser.me/api/portraits/men/2.jpg"
                className="w-8 h-8 rounded-full border border-white"
              />
              <img
                src="https://randomuser.me/api/portraits/women/3.jpg"
                className="w-8 h-8 rounded-full border border-white"
              />
              <img
                src="https://randomuser.me/api/portraits/men/4.jpg"
                className="w-8 h-8 rounded-full border border-white"
              />
            </div>
            <div className="text-white text-sm font-light">
              Trusted by 1000+ users
            </div>
          </div>
        </div>
      </div>

      {/* Global Search Bar - Positioned at bottom center */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-full max-w-3xl px-4 z-10">
        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="relative"
        >
          <div
            className={`relative flex items-center bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl transition-all duration-300 ${
              isSearchFocused
                ? "ring-4 ring-white/50 shadow-2xl scale-[1.02]"
                : "shadow-lg hover:shadow-xl"
            }`}
          >
            {/* Search Icon */}
            <div className="absolute left-4 md:left-6 flex items-center pointer-events-none">
              <MagnifyingGlassIcon
                className={`h-5 w-5 md:h-6 md:w-6 transition-colors duration-300 ${
                  isSearchFocused ? "text-purple-600" : "text-gray-400"
                }`}
              />
            </div>

            {/* Input Field */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => {
                setTimeout(() => setIsSearchFocused(false), 200);
              }}
              placeholder="Search for fabrics, styles..."
              className="w-full py-4 md:py-5 pl-12 md:pl-16 pr-12 md:pr-20 text-base md:text-lg text-gray-900 placeholder-gray-400 bg-transparent border-0 rounded-2xl focus:outline-none focus:ring-0"
            />

            {/* Clear Button */}
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-16 md:right-20 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Clear search"
                >
                  <XMarkIcon className="h-4 w-4 md:h-5 md:w-5 text-gray-400 hover:text-gray-600" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Search Button */}
            <button
              type="submit"
              disabled={!searchQuery.trim()}
              className={`cursor-pointer absolute right-2 md:right-3 px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 ${
                searchQuery.trim()
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg transform hover:scale-105"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Search
            </button>
          </div>

          {/* Quick Search Suggestions
          {isSearchFocused && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 z-50 overflow-hidden"
            >
              <div className="p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Popular Searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Cotton", "Linen", "Ankara", "Silk", "Chiffon"].map(
                    (term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => {
                          setSearchQuery(term);
                          navigate(`/search?q=${encodeURIComponent(term)}`);
                        }}
                        className="px-3 py-1.5 text-sm bg-gray-50 hover:bg-purple-50 text-gray-700 hover:text-purple-700 rounded-lg border border-gray-200 hover:border-purple-300 transition-all duration-200"
                      >
                        {term}
                      </button>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          )} */}
        </motion.form>
      </div>

      {/* Slider Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 ">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`w-8 h-1 rounded-sm transition ${i === index ? "bg-white cursor-pointer" : "bg-gray-400 cursor-pointer"}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
