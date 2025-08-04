import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, ShoppingBag, Sparkles } from "lucide-react";

const CheckModal = ({ isOpen, onClose, id, cartItemId }) => {
  const navigate = useNavigate();

  return (
    isOpen && (
      <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto animate-fade-in-up">
          {/* Success Header */}
          <div className="text-center pt-8 pb-6 px-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Added to Cart!
            </h2>
            <p className="text-gray-600">
              Product successfully added to your cart
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
                    Need a Tailor/Fashion Designer?
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Choose a style from our catalog of talented tailors and
                    fashion designers to create something amazing with your
                    selected material.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/view-cart" className="flex-1">
                <button
                  onClick={onClose}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Go to Checkout</span>
                </button>
              </Link>
              <Link to="/pickastyle" className="flex-1">
                <button
                  onClick={() => {
                    localStorage.setItem("cart_id", id);
                    localStorage.setItem("cart_item_id", cartItemId);
                    navigate("/pickastyle");
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient text-white rounded-xl font-semibold hover:bg-purple-700 transition-all duration-200 shadow-lg"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Pick a Style</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default CheckModal;
