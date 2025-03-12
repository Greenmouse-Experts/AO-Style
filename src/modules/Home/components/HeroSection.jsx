export default function HeroSection() {
    return (
        <section className="relative w-full h-[70vh] flex items-center justify-center bg-cover bg-center px-6 md:px-12"
            style={{ backgroundImage: "url('https://res.cloudinary.com/greenmouse-tech/image/upload/v1741216481/AoStyle/Frame_1618873173_1_yftuuw.png')" }}>

            {/* Left Image */}
            <img src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741216370/AoStyle/image_y0jxbr.png"
                alt="Fashion Style Left" className="absolute left-0 top-0 h-full w-1/3 object-cover hidden md:block" />

            {/* Center Content */}
            <div className="text-center z-10">
                <img
                    src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741724592/AoStyle/Vector_kcxfqx.png"
                    alt="OA Styles"
                    className="h-10 mx-auto mb-10"
                />
                <h5 className="text-2xl md:text-4xl md:leading-16 leading-10 font-bold text-black">
                    Choose A Style, have it Made <br /> and Delivered to your Doorstep
                </h5>
                <div className="italic text-lg text-gray-600 mt-4">
                    <img
                        src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741216806/AoStyle/Precision_Elegance_Quality._p8fnqw.png"
                        alt="OA Styles"
                        draggable="false"
                        className="h-12 mx-auto"
                    />
                </div>
                <button className="bg-gradient text-white px-10 mt-10 py-3 w-full md:w-auto hover:bg-purple-700 transition">
                    Shop Now
                </button>
            </div>

            {/* Right Image */}
            <img src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741216369/AoStyle/image_4_byqwv8.png"
                alt="Fashion Style Right" className="absolute right-0 top-0 h-full w-1/3 object-cover hidden md:block" />
        </section>
    );
}
