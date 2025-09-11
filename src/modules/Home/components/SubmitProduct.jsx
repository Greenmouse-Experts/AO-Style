import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { X } from "lucide-react";

const SubmitProductModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  return (
    isOpen && (
      <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm">
        <div className="bg-white p-6 rounded-lg w-[100%] sm:w-[500px] relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
          {/* Form */}
          <div className="space-y-3">
            <div>
              <h2 className="text-base font-medium mb-3">
                You have successfully added a product{" "}
              </h2>
              <p className="text-sm leading-loose text-gray-500">
                You have added a material and a product to your order, you can
                proceed to checkout or keep shopping{" "}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-between pt-4">
              <Link to="/shop">
                <button className="border  border-[#CCCCCC] text-gray-400 cursor-pointer  px-6 py-3">
                  Back to Shop
                </button>
              </Link>

              <Link to="/view-cart">
                <button className="bg-gradient cursor-pointer text-white border px-6 py-3 ">
                  Proceed to View Cart
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default SubmitProductModal;
