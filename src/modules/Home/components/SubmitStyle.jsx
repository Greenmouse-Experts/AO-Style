import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle, ShoppingBag, ArrowLeft } from "lucide-react";

const SubmitStyleModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto animate-fade-in-up">
        {/* Success Header */}
        <div className="text-center pt-8 pb-6 px-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Successfully Added!
          </h2>
          <p className="text-gray-600 leading-relaxed">
            You have added a style and material to your order. Your custom piece
            is ready for checkout!
          </p>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🎉 Complete Order Ready!
              </h3>
              <p className="text-sm text-gray-600">
                Your fabric and custom style have been combined into a single
                order item with your measurements.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Link to="/view-cart" className="w-full">
              <button
                onClick={onClose}
                className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient text-white rounded-xl font-semibold hover:bg-purple-700 transition-all duration-200 shadow-lg"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Proceed to View Cart</span>
              </button>
            </Link>

            <Link to="/marketplace" className="w-full">
              <button
                onClick={onClose}
                className="w-full flex items-center justify-center space-x-2 px-6 py-4 border-2 border-purple-300 text-purple-700 rounded-xl font-medium hover:bg-purple-50 hover:border-purple-400 transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Continue Shopping</span>
              </button>
            </Link>
          </div>

          {/* Info Text */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Your complete custom order is now in your cart
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitStyleModal;
