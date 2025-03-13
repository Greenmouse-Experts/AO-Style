import React from "react";
import Breadcrumb from "./components/Breadcrumb";
import ShippingInfo from "./components/ShippingInfo";

const ContactUs = () => {
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
                        <div className="">
                            <form className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <input className="w-full p-5 border border-[#f8f8f8] rounded-md focus:outline-none bg-white" type="text" name="firstName" placeholder="First Name" required />
                                    <input className="w-full p-5 border border-[#f8f8f8] rounded-md focus:outline-none bg-white" type="text" name="lastName" placeholder="Last Name" required />
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <input className="w-full p-5 border border-[#f8f8f8] rounded-md focus:outline-none bg-white" type="email" name="email" placeholder="Email Address" required />
                                    <input className="w-full p-5 border border-[#f8f8f8] rounded-md focus:outline-none bg-white" type="tel" name="phone" placeholder="Phone Number" required />
                                </div>
                                <textarea className="w-full p-5 border border-[#f8f8f8] bg-white rounded-md h-42 focus:outline-none" name="message" placeholder="Write your message here..." required></textarea>
                                <button type="submit" className="w-full bg-gradient cursor-pointer text-white py-3 rounded-lg font-semibold">
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Contact Details */}
                    <div className="space-y-6">
                        <span className="text-base font-light text-dark">LET'S CONNECT</span>
                        <h1 className="md:text-4xl text-2xl font-semibold text-dark">Fashion Is Just a Call Away!</h1>
                        <div className="flex items-center space-x-4 mt-4">
                            <img src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741900777/AoStyle/Vector_n3qkjf.png" className="h-10 w-10" draggable="false" alt="Phone Icon" />
                            <div>
                                <h6 className="text-dark leading-loose font-light text-base">PHONE NUMBER</h6>
                                <p className="text-dark font-medium text-lg leading-loose ">(+234) 123 456 7890</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-4">
                            <img src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741900778/AoStyle/Frame_1618873241_e12zlr.png" draggable="false" className="h-10 w-10" alt="Email Icon" />
                            <div>
                                <h6 className="text-dark leading-loose font-light text-lg">EMAIL ADDRESS</h6>
                                <p className="text-dark font-medium text-lg leading-loose">companyemail@domain.com</p>
                                <p className="text-dark font-medium text-lg leading-loose">info@domain.com</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-4">
                            <img src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741900778/AoStyle/Frame_16188732431_ttuziy.png" draggable="false" className="h-10 w-10" alt="Location Icon" />
                            <div>
                                <h6 className="text-dark leading-loose font-light text-lg">LOCATION</h6>
                                <p className="text-dark font-medium text-lg leading-loose">Akgintunde Oludaise Street Lagos State, Nigeria</p>
                                <p className="text-dark font-medium text-lg leading-loose">No 01 Company address, city, state.</p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Map Section */}
                <div className="mt-10">
                    <iframe
                        className="w-full h-64 md:h-96 rounded-lg"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.835434509607!2d144.95373531531673!3d-37.816279742021504!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad642af0f11fd81%3A0xf5774d57ecbc9b31!2sCompany%20Location!5e0!3m2!1sen!2sus!4v1616179872020!5m2!1sen!2sus"
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
