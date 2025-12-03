import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

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

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
              Trusted by users
            </div>
          </div>
        </div>
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
