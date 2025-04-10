import React, { useState } from "react";

const HowDidYouHearAboutUs = () => {
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [isOpen, setIsOpen] = useState(false); 
    const options = [
        "Google",
        "Facebook",
        "Instagram",
        "Word of Mouth",
        "Other"
    ];

    const handleCheckboxChange = (option) => {
        setSelectedOptions((prevState) =>
            prevState.includes(option)
                ? prevState.filter((item) => item !== option)
                : [...prevState, option]
        );
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen); 
    };

    return (
        <div className="relative">
            <label className="block text-gray-700 mb-1">How did you hear about us?</label>
            <div className="relative">
                <button
                    className="w-full p-4 border border-[#CCCCCC] rounded-lg text-left focus:outline-none"
                    onClick={toggleDropdown}
                >
                    {selectedOptions.length > 0
                        ? selectedOptions.join(", ")
                        : "Select options"}
                </button>

                {/* Dropdown list */}
                {isOpen && (
                    <div className="absolute top-15 w-full border border-[#CCCCCC] bg-white rounded-lg z-10">
                        <div className="flex flex-col p-2">
                            {options.map((option, index) => (
                                <label key={index} className="flex items-center p-2">
                                    <input
                                        type="checkbox"
                                        value={option}
                                        checked={selectedOptions.includes(option)}
                                        onChange={() => handleCheckboxChange(option)}
                                        className="mr-2"
                                        required
                                    />
                                    <span>{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HowDidYouHearAboutUs;
