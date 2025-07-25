import React, { useState } from "react";
import axios from "axios";
import Breadcrumb from "./components/Breadcrumb";
import ShippingInfo from "./components/ShippingInfo";
import {
  BsTiktok,
  BsWhatsapp,
  BsInstagram,
  BsFacebook,
  BsTwitterX,
} from "react-icons/bs";

const ContactUs = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Use base URL from env, fallback to relative if not set
  const API_BASE_URL = import.meta.env.VITE_APP_CaryBin_API_URL || "";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      await axios.post(`${API_BASE_URL}/contact/send-contact-message`, form);
      setSuccess("Message sent successfully!");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setError("Failed to send message. Please try again.");
    }
    setLoading(false);
  };

  return (
    <>
      <Breadcrumb
        title="Contact Us"
        subtitle="Contact us"
        backgroundImage="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741899692/AoStyle/image_3_eenvtc.jpg"
      />
      <div className="Resizer section px-4">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Contact Form */}
          <div className="bg-[#F8F8F8] p-8 rounded-2xl">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input
                className="w-full p-5 border border-[#f8f8f8] rounded-md focus:outline-none bg-white"
                type="text"
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
                required
              />
              <input
                className="w-full p-5 border border-[#f8f8f8] rounded-md focus:outline-none bg-white"
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                required
              />
              <textarea
                className="w-full p-5 border border-[#f8f8f8] bg-white rounded-md h-42 focus:outline-none"
                name="message"
                placeholder="Write your message here..."
                value={form.message}
                onChange={handleChange}
                required
              ></textarea>
              <button
                type="submit"
                className="w-full bg-gradient cursor-pointer text-white py-3 rounded-lg font-semibold"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
              {success && (
                <div className="text-green-600 text-center mt-2">{success}</div>
              )}
              {error && (
                <div className="text-red-600 text-center mt-2">{error}</div>
              )}
            </form>
          </div>

          {/* Contact Details */}
          <div className="space-y-6">
            <span className="text-base font-light text-dark">
              LET'S CONNECT
            </span>
            <h1 className="text-2xl md:text-3xl font-semibold text-dark mb-3 mt-3">
              Fashion Is Just a Call Away!
            </h1>
            <div className="flex items-center space-x-4 mt-4">
              <img
                src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741900777/AoStyle/Vector_n3qkjf.png"
                className="h-10 w-10"
                draggable="false"
                alt="Phone Icon"
              />
              <div>
                <h6 className="text-dark leading-loose font-light text-base">
                  PHONE NUMBER
                </h6>
                <p className="text-dark font-medium text-lg leading-loose ">
                  +234 705 355 9086{" "}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-4">
              <img
                src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741900778/AoStyle/Frame_1618873241_e12zlr.png"
                draggable="false"
                className="h-10 w-10"
                alt="Email Icon"
              />
              <div>
                <h6 className="text-dark leading-loose font-light text-lg">
                  EMAIL ADDRESS
                </h6>
                <p className="text-dark font-medium text-lg leading-loose">
                  info@carybin.com
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-4">
              <img
                src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741900778/AoStyle/Frame_16188732431_ttuziy.png"
                draggable="false"
                className="h-10 w-10"
                alt="Location Icon"
              />
              <div>
                <h6 className="text-dark leading-loose font-light text-lg">
                  LOCATION
                </h6>
                <p className="text-dark font-medium text-lg leading-loose">
                  13 Road 101, Efab Sunshine Estate, Waru, Apo, FCT Abuja,
                  Nigeria
                </p>
              </div>
            </div>
            <div className="flex gap-8 mt-6">
              <a
                href="https://www.tiktok.com/@carybin_ltd?lang=en"
                className="hover:text-purple-300 text-[24px]"
              >
                <BsTiktok />
              </a>
              <a
                href="https://www.instagram.com/carybin_ltd/"
                className="hover:text-purple-300 text-[24px]"
              >
                <BsInstagram />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61574779554971"
                className="hover:text-purple-300 text-[24px]"
              >
                <BsFacebook />
              </a>
              <a
                href="https://x.com/Carybin_LTD"
                className="hover:text-purple-300 text-[24px]"
              >
                <BsTwitterX />
              </a>
            </div>
          </div>
        </div>
        {/* Map Section */}
        <div className="mt-10">
          <iframe
            className="w-full h-64 md:h-96 rounded-lg"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3941.407783194832!2d7.4916850757973945!3d8.9345179911231!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x104e13b4bed79703%3A0xedc34529171d9582!2sEFAB%20Sunshine%20Estate!5e0!3m2!1sen!2sus!4v1744286977304!5m2!1sen!2sus"
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>
      <ShippingInfo />
    </>
  );
};

export default ContactUs;
