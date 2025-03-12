import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import { BsLinkedin, BsWhatsapp, BsInstagram, BsFacebook, BsTwitterX } from "react-icons/bs";

const Footer = () => {
    return (
        <footer className="relative text-white jus bg-cover bg-bottom" style={{ backgroundImage: "url('https://res.cloudinary.com/greenmouse-tech/image/upload/v1741734865/AoStyle/Frame_1618873174_htyz4s.jpg')" }}>
            <div className="Resizer mx-auto px-6 grid md:grid-cols-6 gap-4 text-sm">
                {/* Quick Links */}
                <div className="col-span-1">
                    <h4 className="font-medium mb-6 text-lg">Quick Links</h4>
                    <ul className="space-y-6">
                        <li><a href="#" className="hover:underline text-[#C5C5C5] font-light">Home</a></li>
                        <li><a href="#" className="hover:underline text-[#C5C5C5] font-light">About Us</a></li>
                        <li><a href="#" className="hover:underline text-[#C5C5C5] font-light">Shop</a></li>
                        <li><a href="#" className="hover:underline text-[#C5C5C5] font-light">Marketplace</a></li>
                        <li><a href="#" className="hover:underline text-[#C5C5C5] font-light">Contact</a></li>
                        <li><a href="#" className="hover:underline text-[#C5C5C5] font-light">FAQs</a></li>
                    </ul>
                </div>

                {/* Legal */}
                <div className="col-span-1">
                    <h4 className="font-medium mb-6 text-lg">Legal</h4>
                    <ul className="space-y-6">
                        <li><a href="#" className="hover:underline text-[#C5C5C5] font-light">Privacy Policy</a></li>
                        <li><a href="#" className="hover:underline text-[#C5C5C5] font-light">Refund Policy</a></li>
                        <li><a href="#" className="hover:underline text-[#C5C5C5] font-light">Cookie Policy</a></li>
                        <li><a href="#" className="hover:underline text-[#C5C5C5] font-light">Policy Statement</a></li>
                        <li><a href="#" className="hover:underline text-[#C5C5C5] font-light">Terms of Use</a></li>
                    </ul>
                </div>

                {/* Contact Info */}
                <div className="col-span-2">
                    <h4 className="font-medium mb-6 text-lg">Contact Info (Lagos)</h4>
                    <ul className="space-y-6">
                        <p className="flex items-center gap-2 text-[#C5C5C5] font-light"><FaPhone /> (+234) 000 000 0000</p>
                        <p className="flex items-center gap-2 text-[#C5C5C5] font-light"><FaEnvelope /> support@oastyles.com</p>
                        <p className="flex items-center gap-2 text-[#C5C5C5] font-light"><FaMapMarkerAlt /> Akgintunde Oludaise Street Lagos State, Nigeria</p>
                        <p className="flex items-center gap-2 text-[#C5C5C5] font-light"><FaClock /> Office Hours: 9 AM - 6 PM, Mon-Sat</p>
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
                        <a href="#" className="hover:text-purple-300 text-xl"><BsLinkedin /></a>
                        <a href="#" className="hover:text-purple-300 text-xl"><BsInstagram /></a>
                        <a href="#" className="hover:text-purple-300 text-xl"><BsFacebook /></a>
                        <a href="#" className="hover:text-purple-300 text-xl"><BsTwitterX /></a>
                    </div>
                </div>
            </div>
            <div className="text-center text-xs mt-10 pb-2 border-t pt-5">© {new Date().getFullYear()} OASTYLES. All rights reserved.</div>
        </footer>
    );
};

export default Footer;
