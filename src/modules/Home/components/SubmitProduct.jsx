import React from "react";
import { Link, useNavigate } from "react-router-dom";

const SubmitProductModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  return (
    isOpen && (
      <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm">
        <div className="bg-white p-6 rounded-lg w-[100%] sm:w-[500px]">
          {/* Header */}
          {/* <div className="flex justify-between items-center border-b border-[#CCCCCC] outline-none pb-3  mb-4">
            <h2 className="text-lg font-meduim">Continue Shopping</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-black"
            >
              ✕
            </button>
          </div> */}
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
