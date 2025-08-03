import React, { useState } from "react";
import { X, MessageSquare } from "lucide-react";
import StarRating from "./StarRating";
import useCreateReview from "../../hooks/reviews/useCreateReview";

const ReviewForm = ({
  productId,
  isOpen = false,
  onClose = () => {},
  onSuccess = () => {},
}) => {
  console.log("🔍 ReviewForm: Received productId:", productId);
  console.log("🔍 ReviewForm: Modal isOpen:", isOpen);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState({});

  const { createReview, isPending } = useCreateReview();

  const validateForm = () => {
    const newErrors = {};

    if (rating === 0) {
      newErrors.rating = "Please select a rating";
    }

    // Title is optional but has length limit if provided
    if (title.trim() && title.length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

    // Content is optional but has length limits if provided
    if (content.trim() && content.length < 10) {
      newErrors.content = "Review must be at least 10 characters long";
    } else if (content.trim() && content.length > 1000) {
      newErrors.content = "Review must be less than 1000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const reviewData = {
      product_id: productId,
      rating: rating,
    };

    // Only include title if it has content
    if (title.trim()) {
      reviewData.title = title.trim();
    }

    // Only include content if it has content
    if (content.trim()) {
      reviewData.content = content.trim();
    }

    console.log("📤 ReviewForm: About to submit review with data:", reviewData);
    console.log("📤 ReviewForm: Product ID being sent:", productId);

    createReview(reviewData, {
      onSuccess: () => {
        // Reset form
        setRating(0);
        setTitle("");
        setContent("");
        setErrors({});
        onSuccess();
        onClose();
      },
    });
  };

  const handleCancel = () => {
    setRating(0);
    setTitle("");
    setContent("");
    setErrors({});
    onClose();
  };

  if (!isOpen) {
    console.log("❌ ReviewForm: Modal is closed, not rendering");
    return null;
  }

  console.log("✅ ReviewForm: Rendering modal for productId:", productId);

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-lg backdrop-brightness-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare size={24} className="text-[#AB52EE]" />
            Write a Review
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isPending}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating *
            </label>
            <div className="flex items-center gap-2">
              <StarRating
                rating={rating}
                onRatingChange={setRating}
                size={24}
                readonly={isPending}
              />
              <span className="text-sm text-gray-500">
                {rating === 0
                  ? "Select a rating"
                  : `${rating} star${rating !== 1 ? "s" : ""}`}
              </span>
            </div>
            {errors.rating && (
              <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="review-title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Review Title (Optional)
            </label>
            <input
              id="review-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience (optional)..."
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#AB52EE] focus:border-[#AB52EE] ${
                errors.title ? "border-red-300" : "border-gray-300"
              }`}
              maxLength={100}
              disabled={isPending}
            />
            <div className="flex justify-between mt-1">
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title}</p>
              )}
              <p className="text-sm text-gray-500 ml-auto">
                {title.length}/100
              </p>
            </div>
          </div>

          {/* Content */}
          <div>
            <label
              htmlFor="review-content"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Your Review (Optional)
            </label>
            <textarea
              id="review-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tell others about your experience with this product (optional)..."
              rows={4}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#AB52EE] focus:border-[#AB52EE] resize-vertical ${
                errors.content ? "border-red-300" : "border-gray-300"
              }`}
              maxLength={1000}
              disabled={isPending}
            />
            <div className="flex justify-between mt-1">
              {errors.content && (
                <p className="text-sm text-red-600">{errors.content}</p>
              )}
              <p className="text-sm text-gray-500 ml-auto">
                {content.length}/1000
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#AB52EE] hover:bg-[#9542d4] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
