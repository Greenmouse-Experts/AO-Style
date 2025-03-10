import React from "react";

const Breadcrumb = ({ title, subtitle, backgroundImage }) => {
    return (
        <div
            className=" bg-cover bg-center h-92 flex items-center justify-center text-white"
            style={{  width: "100%" , backgroundImage: `url(${backgroundImage})` }}
        >
            
            <div className="Resizer Push">
                <div className="absolute inset-0"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-medium leading-loose">{title}</h1>
                    <p className="text-base">{subtitle}</p>
                </div>
            </div>
        </div>
    );
};

export default Breadcrumb;
