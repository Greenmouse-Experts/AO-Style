import React from "react";
import Breadcrumb from "./components/Breadcrumb";
import {
  HeartHandshake,
  Scissors,
  Star,
  TrendingUp,
  Eye,
  PenTool,
} from "lucide-react";
import ShippingInfo from "./components/ShippingInfo";
import TeamCard from "../../components/TeamCards";

const highlights = [
  {
    title: "Tailoring Reimagined",
    description:
      "Gone are the days of market runs and long queues. OAStyles brings the market to your fingertips — with expert tailors just a click away.",
    icon: Scissors,
  },
  {
    title: "Effortless Elegance",
    description:
      "From selecting fabrics to final fittings, our platform lets you design your dream look from the comfort of your home.",
    icon: Star,
  },
  {
    title: "Fashion That Fits You",
    description:
      "No two people are the same — and your clothes shouldn’t be either. We tailor every piece to your unique measurements and style.",
    icon: HeartHandshake,
  },
  {
    title: "Driven by Impact",
    description:
      "We’re empowering fashion lovers, busy professionals, and creatives with tools to express themselves — stylishly and stress-free.",
    icon: TrendingUp,
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

const teamMembers = [
  {
    name: "Jane Doe",
    role: "Creative Director",
    image: "https://randomuser.me/api/portraits/men/10.jpg",
  },
  {
    name: "John Smith",
    role: "Lead Tailor",
    image: "https://randomuser.me/api/portraits/men/13.jpg",
  },

  {
    name: "Hamzat Adeleke",
    role: "Lead Developer",
    image: "https://randomuser.me/api/portraits/men/14.jpg",
  },

  {
    name: "Grace Ayo",
    role: "Product Manager",
    image: "https://randomuser.me/api/portraits/women/11.jpg",
  },
];

const timeline = [
  {
    year: "2022",
    event:
      "OAStyles was born — built to solve fashion access and delivery challenges.",
  },
  {
    year: "2023",
    event: "Launched our digital fabric selection and tailoring platform.",
  },
  {
    year: "2024",
    event: "Expanded delivery coverage across all major Nigerian cities.",
  },
  {
    year: "2025",
    event:
      "Rolling out international access and fashion partner collaborations.",
  },
];

const AboutUs = () => {
  return (
    <>
      <Breadcrumb
        title="About Us"
        subtitle="About us"
        backgroundImage="https://res.cloudinary.com/greenmouse-tech/image/upload/v1744104104/AoStyle/image_1_xxie9w.jpg"
      />
      <section className="px-6 md:px-16 section lg:px-28 bg-grey-50 relative">
        <div className="flex flex-col-reverse md:flex-row items-center gap-10">
          <div className="md:w-1/1 md:text-left">
            <button className="text-lg font-medium leading-snug px-6 w-full py-2 bg-gradient text-white rounded-md cursor-pointer">
              WHO WE ARE
            </button>
            <p className="mt-4 text-dark text-base leading-[38px]">
              Carybin Limited is the first pan-African e-commerce platform. Our
              global platform empowers users to choose fabrics from the major
              fabric markets in Nigeria, personalize their clothing, and
              seamlessly order both materials and custom-tailored garments.
            </p>
            <p className="text-dark text-base leading-[38px]">
              We are dedicated to serving fashion enthusiasts, designers, and
              anyone seeking bespoke clothing.
            </p>
            <p className="text-dark text-base leading-[38px]">
              Our business combines a user-friendly website{" "}
              <a href="#">www.carybin.com</a> with a strong supply chain to
              provide outstanding products and services. Any personal data
              provided or collected by Oastyles is controlled by Carybin
              Limited.
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
      </section>
      <section className="px-6 md:px-16 lg:px-28 section bg-gradient relative">
        {/* Vision & Mission Cards */}
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
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
              <p className="text-dark leading-loose mt-2 mb-4">
                {section.description}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className="px-6 md:px-16 lg:px-28 just bg-[#f7f7f7] section relative">
        {/* Reviews Badge */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2 border border-[#E070BB] px-4 py-2 rounded-full mt-16 bg-white">
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
      </section>
      <div className="Resizer section px-4">
        {/* Section 1 */}
        <div className="flex flex-col-reverse md:flex-row items-center gap-10 py-8">
          <div className="md:w-1/1 md:text-left">
            <button className="text-lg font-medium  w-full leading-snug px-6 py-2 bg-gradient text-white rounded-md cursor-pointer">
              OUR FOCUS
            </button>
            <p className="mt-4 text-dark text-base leading-[38px]">
              We are focused on bridging the gap that exists between customers
              who are too busy to shop physically at their preferred
              marketplaces in Nigeria.
            </p>
            <p className="text-dark text-base leading-[38px]">
              We offer a seamless and personalized shopping experience for
              high-quality fabrics and bespoke tailoring services. Our diverse
              range of premium fabrics, combined with expert tailoring and
              design consultation, ensures that every customer can create unique
              and perfectly fitted garments.
            </p>
          </div>
          <div className="md:w-1/2">
            <img
              src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741885799/AoStyle/image1_etirxc.jpg"
              alt="Happy Customers"
              className="rounded-lg w-full"
            />
          </div>
        </div>
        {/* Section 2 */}
        <div className="mt-16">
          <h2 className="text-2xl md:text-3xl font-medium text-center">
            With OAStyles, you don’t just buy fabric; you create your own
            fashion story.
          </h2>
          <p className="text-dark text-base leading-loose text-center mt-2 mb-10">
            We pride ourselves on our commitment to quality, customization, and
            customer satisfaction.
          </p>

          {/* Image & Features */}
          <section className="px-4 pb-16 mt-10">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {highlights.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center p-4 bg-gray-100 rounded-lg hover:shadow-md transition"
                >
                  <item.icon className="text-[#AB52EE]" size={36} />
                  <h3 className="mt-4 text-lg font-medium leading-loose">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2 leading-loose">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
          {/* Meet the Team */}
          <section className="px-4">
            <h2 className="text-2xl md:text-3xl font-medium text-center mb-10">
              Meet the Team Behind Carybin Limited
            </h2>
            <div className="flex flex-col md:flex-row justify-center gap-10 text-center">
              {/* Caleb E. Anwara */}
              <TeamCard
                name="Caleb E. Anwara"
                role="CHIEF EXECUTIVE OFFICER/CHIEF OPERATING OFFICER"
                image="https://res.cloudinary.com/dmlgns85e/image/upload/v1753464597/Untitled_m94bsn.jpg"
                shortText="Tech-savvy professional with 16+ years in ICT, delivering scalable solutions and leading multiple IT projects to success."
                fullText="I'm a tech-savvy professional with over 16 years of experience in the ICT sector, delivering scalable solutions across diverse industries. As a certified and seasoned project manager, I’ve successfully led multiple IT deployments—on time and within budget—while maintaining a sharp focus on results and customer value.

My passion lies in building businesses that transform lives, reshape business cultures, and create meaningful impact. I see every obstacle as an opportunity in disguise and thrive on turning ideas into actionable, value-driven solutions.

I believe in the power of collaboration—because with the right team, no solution is out of reach."
              />
              {/* Favour Anwara */}
              <TeamCard
                name="Favour Anwara"
                role="Chief Technical Officer"
                image="https://res.cloudinary.com/dmlgns85e/image/upload/v1753464596/Untitled2_ubuajp.jpg"
                shortText="Engineer with a B.S in Computer Engineering and 4 years of backend development experience. Passionate about innovation."
                fullText="A skilled engineer with a B.S in Computer Engineering from Enugu State University of Science and Technology and 4 years of experience in backend development. Passionate about innovation, I drive the company’s tech solutions to produce maximum results."
              />
            </div>
          </section>
        </div>
      </div>

      {/* <section className="relative w-full">
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
            </section> */}
      {/* <div className="just"></div> */}
      <ShippingInfo />
    </>
  );
};

export default AboutUs;
