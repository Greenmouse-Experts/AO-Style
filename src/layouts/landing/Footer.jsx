import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import { BsTiktok, BsWhatsapp, BsInstagram, BsFacebook, BsTwitterX } from "react-icons/bs";
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

const Footer = () => {

    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [pathname]);

    return (
        <footer className="relative text-white jus bg-cover bg-bottom" style={{ backgroundImage: "url('https://res.cloudinary.com/greenmouse-tech/image/upload/v1741734865/AoStyle/Frame_1618873174_htyz4s.jpg')" }}>
            <div className="Resizer mx-auto px-6 grid md:grid-cols-6 gap-4 text-sm">
                {/* Quick Links */}
                <div className="col-span-1">
                    <h4 className="font-medium mb-6 text-lg">Quick Links</h4>
                    <ul className="space-y-6">
                        <li><Link to="/" className="hover:underline text-[#C5C5C5] font-light">Home</Link></li>
                        <li><Link to="/about" className="hover:underline text-[#C5C5C5] font-light">About Us</Link></li>
                        <li><Link to="/shop" className="hover:underline text-[#C5C5C5] font-light">Shop</Link></li>
                        <li><Link to="/marketplace" className="hover:underline text-[#C5C5C5] font-light">Marketplace</Link></li>
                        <li><Link to="/contact" className="hover:underline text-[#C5C5C5] font-light">Contact</Link></li>
                        <li><Link to="/faqs" className="hover:underline text-[#C5C5C5] font-light">FAQs</Link></li>
                    </ul>
                </div>

                {/* Legal */}
                <div className="col-span-1">
                    <h4 className="font-medium mb-6 text-lg">Legal</h4>
                    <ul className="space-y-6">
                        <li><Link to="/privacy-policy" className="hover:underline text-[#C5C5C5] font-light">Privacy Policy</Link></li>
                        <li><Link to="/refund-policy" className="hover:underline text-[#C5C5C5] font-light">Refund Policy</Link></li>
                        <li><Link to="/cookie-policy" className="hover:underline text-[#C5C5C5] font-light">Cookie Policy</Link></li>
                        <li><Link to="/policy-statement" className="hover:underline text-[#C5C5C5] font-light">Policy Statement</Link></li>
                        <li><Link to="/terms" className="hover:underline text-[#C5C5C5] font-light">Terms of Use</Link></li>
                    </ul>
                </div>

                {/* Contact Info */}
                <div className="col-span-2">
                    <h4 className="font-medium mb-6 text-lg">Contact Info (Lagos)</h4>
                    <ul className="space-y-6">
                        <p className="flex items-center gap-2 text-[#C5C5C5] font-light"><FaPhone /> +234 705 355 9086</p>
                        <p className="flex items-center gap-2 text-[#C5C5C5] font-light"><FaEnvelope /> info@carybin.com</p>
                        <p className="flex items-center gap-2 text-[#C5C5C5] font-light"><FaMapMarkerAlt /> 13 Road 101, Efab Sunshine Estate, Waru, Apo, FCT Abuja, Nigeria</p>
                        <p className="flex items-center gap-2 text-[#C5C5C5] font-light"><FaClock />Office hours: Mon – Friday: 8am – 5pm, Sat: 10am – 2pm </p>
                    </ul>
                </div>

                {/* Newsletter Signup */}
                <div className="col-span-2 bg-[#412196] p-6 rounded-lg">
                    <h4 className="font-medium mb-6 text-lg">Sign Up & Save Up to 10%</h4>
                    <p className="text-sm mb-4 text-[#C5C5C5] font-light">Get access to exclusive deals and discounts</p>
                    <form action="">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="w-full p-4 mb-4 border border-white text-white outline-none" required
                        />
                        <button className="ma-auto px-6 bg-white py-4 text-black hover:bg-purple-600 hover:text-white cursor-pointer" type="submit">SUBSCRIBE</button>
                    </form>
                    <div className="flex gap-8 mt-6">
                        <a href="https://www.tiktok.com/@carybin_ltd?lang=en" className="hover:text-purple-300 text-[24px]"><BsTiktok /></a>
                        <a href="https://www.instagram.com/carybin_ltd/" className="hover:text-purple-300 text-[24px]"><BsInstagram /></a>
                        <a href="https://www.facebook.com/profile.php?id=61574779554971" className="hover:text-purple-300 text-[24px]"><BsFacebook /></a>
                        <a href="https://x.com/Carybin_LTD" className="hover:text-purple-300 text-[24px]"><BsTwitterX /></a>
                    </div>
                </div>
            </div>
            <div className="text-center text-xs mt-10 pb-2 border-t pt-5">© {new Date().getFullYear()} CARYBIN LIMITED. All rights reserved.</div>
        </footer>
    );
};

export default Footer;
