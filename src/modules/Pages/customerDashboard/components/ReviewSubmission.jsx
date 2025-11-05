import React, { useState } from "react";
import { Star, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
// import Car from "../../services/carybinApi"; // Adjust path as needed
import CaryBinApi from "../../../../services/CarybinBaseUrl";

const ReviewSubmission = ({ productId, productName, productImage, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const queryClient = useQueryClient();

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData) => {
      console.log("This is the review sending to the backend", reviewData)
      const response = await CaryBinApi.post("/review/create", reviewData);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Review submitted successfully:", data);
      setSubmitSuccess(true);
      setSubmitError(null);
      
      // Reset form after 2 seconds and close
      setTimeout(() => {
        resetForm();
        if (onClose) onClose();
      }, 2000);
    },
    onError: (error) => {
      console.error("Review submission error:", error);
      setSubmitError(
        error.response?.data?.message || "Failed to submit review. Please try again."
      );
      setSubmitSuccess(false);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    // Validation
    if (rating === 0) {
      setSubmitError("Please select a rating");
      return;
    }

    if (!content.trim()) {
      setSubmitError("Please write a review");
      return;
    }

    // Prepare data matching the API format
    const reviewData = {
      rating: rating,
      title: title.trim() || undefined, // optional
      content: content.trim(),
      product_id: productId,
    };

    console.log("Submitting review:", reviewData);
    setIsSubmitting(true);
    
    try {
      await submitReviewMutation.mutateAsync(reviewData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setTitle("");
    setContent("");
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  return (
    <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">Write a Review</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Product Info */}
      {productName && (
        <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          {productImage && (
            <img
              src={productImage}
              alt={productName}
              className="w-16 h-16 rounded-md object-cover"
            />
          )}
          <div>
            <h4 className="font-semibold text-lg">{productName}</h4>
            <p className="text-sm text-gray-600">Share your experience with this product</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {submitSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">Review submitted successfully!</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {submitError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110 focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoveredRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-200 text-gray-200"
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm text-gray-600">
                {rating} star{rating !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {/* Review Title (Optional) */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Review Title <span className="text-gray-400">(Optional)</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Great quality fabric!"
            maxLength={100}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
          />
          <p className="text-xs text-gray-500 mt-1">
            {title.length}/100 characters
          </p>
        </div>

        {/* Review Content */}
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Your Review <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tell us about your experience with this product..."
            rows={5}
            maxLength={1000}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            {content.length}/1000 characters
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting || submitSuccess}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition ${
              isSubmitting || submitSuccess
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Submitting...
              </span>
            ) : submitSuccess ? (
              "Review Submitted!"
            ) : (
              "Submit Review"
            )}
          </button>
          
          {onClose && !submitSuccess && (
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Guidelines */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h5 className="font-medium text-blue-900 mb-2">Review Guidelines</h5>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Be honest and specific about your experience</li>
          <li>• Focus on the product quality and features</li>
          <li>• Keep your review respectful and constructive</li>
          <li>• Avoid including personal information</li>
        </ul>
      </div>
    </div>
  );
};

export default ReviewSubmission;