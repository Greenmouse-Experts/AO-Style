import React from "react";
import { Link } from "react-router-dom";


const Breadcrumb = ({ title, subtitle, just,  backgroundImage }) => {
    return (
        <div
            className=" bg-cover bg-center h-92 flex items-center justify-center text-white"
            style={{ width: "100%", backgroundImage: `url(${backgroundImage})` }}
        >

            <div className="Resizer Push">
                <div className="relative z-10">
                    <h1 className="text-4xl font-semibold">{title}</h1>
                    <nav className="text-sm text-gray-300 mt-2 flex items-center space-x-2">
                        <Link to="/" className="hover:text-white">Home</Link>
                        <span>{">"}</span>
                        <span className="text-white">{subtitle}</span>
                        <span className="text-white">{just}</span>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default Breadcrumb;
