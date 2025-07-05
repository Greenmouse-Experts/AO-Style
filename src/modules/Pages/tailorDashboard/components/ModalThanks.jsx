import React from 'react';
import { Link } from "react-router-dom";

const ThanksModal = ({ isOpen, onClose }) => {

    return (
        isOpen && (
            <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm">
                <div className="bg-white p-6 rounded-lg w-[100%] sm:w-[500px]">
                    {/* Header */}
                    <div className="flex justify-between items-center border-b border-[#CCCCCC] outline-none pb-3  mb-4">
                        <h2 className='text-lg font-meduim'>.</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-black">
                            ✕
                        </button>
                    </div>
                    {/* Form */}
                    <div className="space-y-3">
                        <div>
                            <h2 className="text-base font-meduim mb-3">You have successfully submitted your style ?</h2>
                           <p className='text-sm leading-loose text-gray-500'>
                           You have submitted a style for publishing, you will be notified when it is published 
                           </p>
                        </div>
                        
                        {/* Buttons */}
                        <div className="flex justify-between pt-4">
                            <button onClick={onClose} className="border px-6 py-3 border-[#CCCCCC] text-gray-400 cursor-pointer">
                            Cancel
                            </button>
                            <Link to="/tailor">
                                <button className="bg-gradient text-white px-6 py-3 cursor-pointer">
                                Ok, thanks! 
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    );
};

export default ThanksModal;
