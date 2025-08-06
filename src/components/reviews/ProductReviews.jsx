import React, { useState } from "react";
import { MessageSquare, Plus, Star, X, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ReviewSummary from "./ReviewSummary";
import ReviewList from "./ReviewList";
import ReviewForm from "./ReviewForm";
import sessionManager from "../../services/SessionManager";

const ProductReviews = ({
  productId,
  className = "",
  showAddReview = true,
  initiallyExpanded = false,
}) => {
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const navigate = useNavigate();

  console.log("🔍 ProductReviews: Received productId:", productId);
  console.log("🔍 ProductReviews: Product ID type:", typeof productId);
  console.log("🔍 ProductReviews: Product ID length:", productId?.length);

  // Validate product ID format (should be a valid UUID)
  const isValidUUID =
    productId &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      productId,
    );

  console.log("🔍 ProductReviews: Is valid UUID?", isValidUUID);

  if (!productId) {
    console.log("❌ ProductReviews: No product ID provided");
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500">Product ID is required to load reviews.</p>
      </div>
    );
  }

  if (!isValidUUID) {
    console.log("❌ ProductReviews: Invalid product ID format:", productId);
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500">
          Invalid product ID format. Please check the product data.
        </p>
        <p className="text-xs text-gray-400 mt-1">Received: {productId}</p>
      </div>
    );
  }

  const handleReviewSuccess = () => {
    // The review list will automatically refresh due to query invalidation
    // in the useCreateReview hook
  };

  const handleWriteReviewClick = () => {
    // Check if user is authenticated
    const authData = sessionManager.getAuthData();
    const isAuthenticated =
      !!authData && !sessionManager.isRefreshTokenExpired();

    console.log("🔒 ProductReviews: Authentication check:", {
      hasAuthData: !!authData,
      isRefreshTokenExpired: authData
        ? sessionManager.isRefreshTokenExpired()
        : "N/A",
      isAuthenticated,
    });

    if (!isAuthenticated) {
      console.log(
        "🚪 ProductReviews: User not authenticated, showing login prompt",
      );
      setShowLoginPrompt(true);
      return;
    }

    console.log("✅ ProductReviews: User authenticated, opening review form");
    setIsReviewFormOpen(true);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-xl font-semibold text-gray-900 hover:text-[#AB52EE] transition-colors"
        >
          <MessageSquare size={24} />
          Customer Reviews
          <Star size={20} className="text-yellow-400 fill-current" />
        </button>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="space-y-6">
          {/* Review Summary */}
          <ReviewSummary productId={productId} showEmptyState={true} />

          {/* Reviews List */}
          <ReviewList productId={productId} showEmptyState={false} />
        </div>
      )}

      {/* Compact Summary when collapsed */}
      {!isExpanded && (
        <div className="bg-gray-50 rounded-lg p-4">
          <ReviewSummary productId={productId} showEmptyState={true} />
          <button
            onClick={() => setIsExpanded(true)}
            className="mt-4 text-[#AB52EE] hover:text-[#9542d4] font-medium text-sm transition-colors"
          >
            View All Reviews →
          </button>
        </div>
      )}

      {/* Review Form Modal */}
      <ReviewForm
        productId={productId}
        isOpen={isReviewFormOpen}
        onClose={() => {
          console.log("❌ ProductReviews: Closing review form");
          setIsReviewFormOpen(false);
        }}
        onSuccess={handleReviewSuccess}
      />

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <LogIn size={24} className="text-[#AB52EE]" />
                Login Required
              </h2>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="text-center">
                <MessageSquare
                  size={48}
                  className="mx-auto text-gray-300 mb-4"
                />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Sign in to write a review
                </h3>
                <p className="text-gray-600">
                  You need to be logged in to share your experience and help
                  other customers make informed decisions.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLoginPrompt(false);
                    navigate("/login", {
                      state: {
                        from: window.location.pathname,
                        message: "Please log in to write a review",
                      },
                    });
                  }}
                  className="flex-1 px-4 py-2 bg-[#AB52EE] hover:bg-[#9542d4] text-white rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  <LogIn size={18} />
                  Go to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
