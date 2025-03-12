import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
    {
        id: 1,
        image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741204138/AoStyle/image2_vx85sg.jpg",
        heading: "Connecting customers to <span class='font-bold italic'>Fashion Designers</span>",
        description:
            "Welcome to OAStyles, a platform that simplifies tailoring processes; from buying materials to finding a tailor for you.",
        buttonText: "Shop Now",
    },
    {
        id: 2,
        image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214080/AoStyle/image_idfv3e.jpg",
        heading: "Connecting customers to <span class='font-bold italic'>Fabric Vendors</span>",
        description:
            "Find the best fashion trends and designs from top designers around the world. Get inspired and shop effortlessly.",
        buttonText: "Explore Now",
    },
    {
        id: 3,
        image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214079/AoStyle/image3_xi3hxi.jpg",
        heading: "Get your order to your doorstep - <span class='font-bold italic'> In time !</span>",
        description:
            "Get custom-made outfits designed to match your unique style and preferences, delivered right to your doorstep.",
        buttonText: "Get Started",
    },
    {
        id: 4,
        image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741332601/AoStyle/Frame_1618873277_gzl5cm.jpg",
        heading: "A virtual marketplace that offers high-quality fabrics, bespoke tailoring services and seamless door delivery to customers in time.",
        buttonText: "Shop Now",
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
            <AnimatePresence mode="wait">
                <motion.div
                    key={slides[index].id}
                    className="absolute inset-0 w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${slides[index].image})` }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                />
            </AnimatePresence>

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
                    className="text-2xl md:text-5xl font-medium leading-tight"
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
                <motion.button
                    key={`button-${index}`}
                    className="mt-6 px-8 py-3 bg-white text-purple-600 font-normla rounded-md hover:bg-gray-200 transition"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    {slides[index].buttonText}
                </motion.button>
                {/* Trusted Users Section */}
                <div className="absolute bottom-24 left-6px-4 py-2 rounded-md flex items-center gap-4">
                    <div className="flex -space-x-2">
                        <img src="https://randomuser.me/api/portraits/women/1.jpg" className="w-8 h-8 rounded-full border border-white" />
                        <img src="https://randomuser.me/api/portraits/men/2.jpg" className="w-8 h-8 rounded-full border border-white" />
                        <img src="https://randomuser.me/api/portraits/women/3.jpg" className="w-8 h-8 rounded-full border border-white" />
                        <img src="https://randomuser.me/api/portraits/men/4.jpg" className="w-8 h-8 rounded-full border border-white" />
                    </div>
                    <div className="text-white text-sm font-light">Trusted by 1000+ users</div>
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
