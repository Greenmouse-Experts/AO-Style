import React from "react";
import { Link } from "react-router-dom";

const Breadcrumb = ({ title, subtitle, just, backgroundImage }) => {
    const routeMap = {
        "Products": "/products",
        "OAStyles": "/aostyle-details",
        "OAStyles Details": "/aostyle-details",
        "Shop": "/shop",
        "PickaStyle": "/pickastyle",
        "Pick A Style": "/pickastyle",
        "About us": "/about",
        "Contact us": "/contact",
        "Frequently Asked Questions": "/faqs",
        "Policy Statement": "/policy-statement",
        "Privacy Policy": "/privacy-policy",
        "Terms and Conditions": "/terms",
        "Cookie Policy": "/cookie-policy",
        "Refund Policy": "/refund-policy",
        "Shipping Policy": "/shipping-policy",
        "Marketplace": "/marketplace",
        "Onitsha Main Market": "/inner-marketplace",
        "All Styles": "/all-styles",
        "Luxury Linen": "/inner-marketplace",
        "Get Access to the best Tailors and a range of Designs for your next outfit": "/products",
        "A virtual marketplace that offers access to tailors and fashion designers around the country": "/marketplace",
        "Find the perfect fabric for your next outfit": "/marketplace",
        "Shop the latest styles and trends": "/marketplace",
        "Shop the latest fabrics and styles": "/marketplace",
        "Get inspired by our collection of fabrics and designs": "/marketplace",
        "Access fabric markets all around the country from your home": "/marketplace",
        "Enjoy a wide selection of Materials & Designs": "/shop-details",
    };

    const subtitleRoute = subtitle ? (routeMap[subtitle] || routeMap[Object.keys(routeMap).find(key => subtitle.includes(key)) || ""] || "/") : "/";
    const justText = just ? just.replace(">", "").trim() : null;
    const justRoute = justText ? (routeMap[justText] || `/${justText.toLowerCase().replace(/ /g, '-')}`) : "/";

    return (
        <div
            className="bg-cover bg-center h-92 flex items-center justify-center text-white"
            style={{ width: "100%", backgroundImage: `url(${backgroundImage})` }}
        >
            <div className="Resizer Push">
                <div className="relative z-10">
                    <h1 className="text-4xl font-semibold">{title}</h1>
                    <nav className="text-sm text-gray-300 mt-2 flex items-center space-x-2">
                        <Link to="/" className="hover:text-white">Home</Link>
                        <span>{">"}</span>
                        <Link to={subtitleRoute} className="hover:text-white">{subtitle}</Link>
                        {just && <><span>{">"}</span><Link to={justRoute} className="hover:text-white">{justText}</Link></>}
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default Breadcrumb;