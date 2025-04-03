import React from "react";
import Breadcrumb from "./components/Breadcrumb";
import {
    Package,
    Shirt,
    Smile,
    Gem,
    DollarSign,
    Eye, PenTool
} from "lucide-react";
import ShippingInfo from "./components/ShippingInfo";
import { Link } from "react-router-dom";

// Feature List
const features = [
    {
        title: "Convenience",
        description:
            "Offering an easy-to-use online platform for selecting fabrics, designing garments, and accessing tailoring services.",
        icon: Package,
    },
    {
        title: "Personalization",
        description:
            "Highlighting the ability to customize garments to individual tastes and measurements.",
        icon: Shirt,
    },
    {
        title: "Quality",
        description:
            "Emphasis on the high quality of fabrics and craftsmanship in tailoring.",
        icon: Gem,
    },
    {
        title: "Affordability",
        description:
            "We offer the best price on the fabrics and tailoring services we offer.",
        icon: DollarSign,
    },
];

// Alone
const alones = [

    {
        title: "Customer Satisfaction",
        description:
            "Commitment to ensuring a high level of customer satisfaction through quality products and excellent customer support.",
        icon: Smile,
    },
];

// Vision & Mission Data
const sections = [
    {
        title: "Our Vision",
        description:
            "Building a virtual marketplace that offers high-quality fabrics, bespoke tailoring services, and seamless door delivery to customers in time.",
        icon: Eye,
    },
    {
        title: "Our Mission",
        description:
            "Our global platform empowers users to choose fabrics, personalize their clothing, and seamlessly order both materials and custom-tailored garments.",
        icon: PenTool,
    },
];


const AboutUs = () => {
    return (
        <>
            <Breadcrumb
                title="About Us"
                subtitle="About us"
                backgroundImage="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741885654/AoStyle/image_kag9em.jpg"
            />
            <div className="Resizer section px-4">
                {/* Section 1 */}
                <div className="flex flex-col-reverse md:flex-row items-center gap-10">
                    <div className="md:w-1/1 md:text-left">
                        <h1 className="text-2xl md:text-3xl font-medium leading-snug">
                            We are focused on bridging the gap that exists between customers who
                            are too busy to shop physically at their preferred marketplaces in
                            Nigeria.
                        </h1>
                        <p className="mt-4 text-dark text-base leading-loose">
                            We offer a seamless and personalized shopping experience for
                            high-quality fabrics and bespoke tailoring services. Our diverse
                            range of premium fabrics, combined with expert tailoring and design
                            consultation, ensures that every customer can create unique and
                            perfectly fitted garments.
                        </p>
                    </div>
                    <div className="md:w-1/2">
                        <img
                            src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741885798/AoStyle/image_1_icbrmn.jpg"
                            alt="Fashion Designer"
                            className="rounded-lg w-full"
                        />
                    </div>
                </div>

                {/* Section 2 */}
                <div className="mt-16">
                    <h2 className="text-2xl md:text-3xl font-medium">
                        With OAStyles, you don’t just buy fabric; you create your own fashion
                        story.
                    </h2>
                    <p className="text-dark text-base leading-loose mt-2 mb-10">
                        We pride ourselves on our commitment to quality, customization, and
                        customer satisfaction.
                    </p>

                    {/* Image & Features */}
                    <div className="flex flex-col md:flex-row items-center gap-10">
                        {/* Image */}
                        <div className="md:w-1/2">
                            <img
                                src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741885799/AoStyle/image1_etirxc.jpg"
                                alt="Happy Customers"
                                className="rounded-lg w-full"
                            />

                        </div>
                        {/* Features */}
                        <div className="md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {features.map((feature, index) => (
                                <div key={index} className="flex flex-col md:items-start items-center">
                                    {/* Icon */}
                                    <feature.icon className="text-[#AB52EE]" size={35} />
                                    {/* Title & Description */}
                                    <h3 className="text-lg font-medium leading-relaxed mt-3 mb-2">{feature.title}</h3>
                                    <p className="text-dark leading-loose md:text-left text-center">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:mt-10 mt-8">
                        {alones.map((alone, index) => (
                            <div key={index} className="flex flex-col md:items-start items-center">
                                {/* Icon */}
                                <alone.icon className="text-[#AB52EE]" size={35} />
                                {/* Title & Description */}
                                <h3 className="text-lg font-medium leading-relaxed mt-3 mb-2">{alone.title}</h3>
                                <p className="text-dark leading-loose md:text-left text-center">{alone.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <section className="px-6 md:px-16 lg:px-28 just bg-[#fafafa] relative">
                {/* Reviews Badge */}
                <div className="flex justify-center">
                    <div className="flex items-center gap-2 border border-[#E070BB] px-4 py-2 rounded-full sm:-mt-6 mt-2 bg-white">
                        {/* Avatar Group */}
                        <div className="flex -space-x-2">
                            <img
                                src="https://randomuser.me/api/portraits/women/1.jpg"
                                alt="User 1"
                                className="w-8 h-8 rounded-full border border-white"
                            />
                            <img
                                src="https://randomuser.me/api/portraits/men/1.jpg"
                                alt="User 2"
                                className="w-8 h-8 rounded-full border border-white"
                            />
                            <img
                                src="https://randomuser.me/api/portraits/women/2.jpg"
                                alt="User 3"
                                className="w-8 h-8 rounded-full border border-white"
                            />
                        </div>
                        <span className="text-purple-600 font-normal text-sm">
                            790+ Positive Users Reviews
                        </span>
                    </div>
                </div>

                {/* Title & Subtitle */}
                <div className="text-center mt-10">
                    <h2 className="text-2xl md:text-3xl font-meduim">
                        Offering a unique and stylish perspective on fashion.
                    </h2>
                    <p className="text-dark text-bas leading-loose mt-2">
                        We are dedicated to serving fashion enthusiasts, designers, and
                        anyone seeking bespoke clothing.
                    </p>
                </div>

                {/* Vision & Mission Cards */}
                <div className="relative z-10 mt-16 flex flex-col md:flex-row items-center gap-6">
                    {sections.map((section, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-lg p-6 md:w-1/2 relative z-10"
                        >
                            {/* Icon */}
                            <div className="bg-[#FFF2FF] p-3 rounded-sm inline-block">
                                <section.icon className="text-[#E070BB]" size={36} />
                            </div>
                            {/* Title & Description */}
                            <h3 className="text-xl font-medium mt-4">{section.title}</h3>
                            <p className="text-dark leading-loose mt-2 mb-4">{section.description}</p>
                        </div>
                    ))}
                </div>

                {/* Blue Background */}
                <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient z-0"></div>
            </section>
            <section className="relative w-full">
                <div className="relative w-full">
                    <img
                        src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741891529/AoStyle/image_2_vp7jbt.jpg"
                        alt="Tailor working"
                        className="w-full h-[500px] sm:[700px] object-cover"
                    />
                </div>

                <div className="absolute top-0 left-0 w-full h-full flex items-center px-6 md:px-16 lg:px-28">
                    <div className="bg-white p-6 md:p-8 lg:p-10 rounded-lg shadow-lg max-w-lg">
                        <h2 className="text-2xl md:text-3xl font-medium leading-relaxed">
                            Get clients and Customers with ease!
                        </h2>
                        <p className="text-dark text-base leading-loose mt-3">
                            As a tailor/fashion designer, fabric vendor, or a logistic agent,
                            OAStyles is a platform for you to make more money. Join the
                            community today and enjoy all the benefits.
                        </p>
                        <Link to='/sign-up'>
                            <button className="mt-6 px-6 py-3 bg-gradient text-white font-normal rounded-md cursor-pointer">
                                GET STARTED
                            </button>
                        </Link>
                    </div>
                </div>
            </section>
            <div className="just"></div>
            <ShippingInfo />
        </>

    );
};


export default AboutUs;
