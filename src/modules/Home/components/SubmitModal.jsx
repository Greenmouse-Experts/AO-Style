import React from 'react';
import { Link } from "react-router-dom";

const SubmitModal = ({ isOpen, onClose }) => {

    return (
        isOpen && (
            <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm">
                <div className="bg-white p-6 rounded-lg w-[100%] sm:w-[500px]">
                    {/* Header */}
                    <div className="flex justify-between items-center border-b border-[#CCCCCC] outline-none pb-3  mb-4">
                        <h2 className='text-lg font-meduim'></h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-black">
                            ✕
                        </button>
                    </div>
                    {/* Form */}
                    <div className="space-y-3">
                        <div>
                            <h2 className="text-base font-medium mb-3">Do you need to buy a Fabric for this style ?</h2>
                            <p className='text-sm leading-loose text-gray-500'>
                                You can choose to buy fabrics from our material place to sew or you can also send in a your preexisting fabrics
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-between pt-4">
                            <Link to="/marketplace">
                                <button className="border border-[#CCCCCC] text-gray-400 cursor-pointer  px-6 py-3">
                                    Yes, go to Marketplace
                                </button>
                            </Link>
                            <Link to="/view-cart">
                                <button onClick={handleModalClose} className="bg-gradient text-white border px-6 py-3 ">
                                    No, go to checkout
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    );
};

export default SubmitModal;
