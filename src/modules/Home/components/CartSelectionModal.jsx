import React from "react";
import { ShoppingCart, Sparkles, CheckCircle, X } from "lucide-react";

const CartSelectionModal = ({
  isOpen,
  onClose,
  onAddToCart,
  onSelectStyles,
  isPending,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto animate-fade-in-up relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
        </button>

        {/* Header */}
        <div className="text-center pt-8 pb-6 px-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Great Choice!
          </h2>
          <p className="text-gray-600">
            How would you like to proceed with your fabric selection?
          </p>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Want to add a custom style?
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Browse our collection of talented tailors and fashion
                  designers to create something amazing with your selected
                  fabric.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={onAddToCart}
              disabled={isPending}
              className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient text-white rounded-xl font-semibold hover:bg-purple-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>{isPending ? "Adding to Cart..." : "Add to Cart Now"}</span>
            </button>

            <button
              onClick={onSelectStyles}
              disabled={isPending}
              className="w-full flex items-center justify-center space-x-2 px-6 py-4 border-2 border-purple-300 text-purple-700 rounded-xl font-medium hover:bg-purple-50 hover:border-purple-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-5 h-5" />
              <span>Select Styles First</span>
            </button>
          </div>

          {/* Info Text */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              You can always add styles later from your cart
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSelectionModal;
