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
    <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/50 backdrop-blur-sm p-3 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto my-auto animate-fade-in-up relative max-h-[95vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors z-10 touch-manipulation"
          aria-label="Close modal"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 hover:text-gray-700" />
        </button>

        {/* Header */}
        <div className="text-center pt-6 sm:pt-8 pb-4 sm:pb-6 px-4 sm:px-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            Great Choice!
          </h2>
          <p className="text-sm sm:text-base text-gray-600 px-2">
            How would you like to proceed with your fabric selection?
          </p>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 mb-4 sm:mb-6">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <div className="flex-shrink-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                  Want to add a custom style?
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Browse our collection of talented tailors and fashion
                  designers to create something amazing with your selected
                  fabric.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 sm:gap-3">
            <button
              onClick={onAddToCart}
              disabled={isPending}
              className="cursor-pointer w-full flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 sm:py-4 bg-gradient text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:bg-purple-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[44px] sm:min-h-[48px]"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="whitespace-nowrap">{isPending ? "Adding to Cart..." : "Add to Cart Now"}</span>
            </button>

            <button
              onClick={onSelectStyles}
              disabled={isPending}
              className="cursor-pointer w-full flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 sm:py-4 border-2 border-purple-300 text-purple-700 rounded-lg sm:rounded-xl font-medium text-sm sm:text-base hover:bg-purple-50 hover:border-purple-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[44px] sm:min-h-[48px]"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="whitespace-nowrap">Select Styles First</span>
            </button>
          </div>

          {/* Info Text */}
          <div className="mt-3 sm:mt-4 text-center">
            <p className="text-xs sm:text-sm text-gray-500">
              You can always add styles later from your cart
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSelectionModal;
