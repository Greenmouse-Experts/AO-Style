import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({
  rating = 0,
  maxRating = 5,
  onRatingChange = null,
  size = 20,
  readonly = false,
  showValue = false,
  className = ""
}) => {
  const handleStarClick = (selectedRating) => {
    if (!readonly && onRatingChange) {
      onRatingChange(selectedRating);
    }
  };

  const handleStarHover = (hoveredRating) => {
    if (!readonly && onRatingChange) {
      // You can add hover effect logic here if needed
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center">
        {[...Array(maxRating)].map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= rating;
          const isPartiallyFilled = !isFilled && starValue - 1 < rating && rating < starValue;

          return (
            <button
              key={index}
              type="button"
              className={`relative transition-colors duration-200 ${
                readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
              }`}
              onClick={() => handleStarClick(starValue)}
              onMouseEnter={() => handleStarHover(starValue)}
              disabled={readonly}
            >
              {isPartiallyFilled ? (
                <div className="relative">
                  <Star
                    size={size}
                    className="text-gray-300"
                    fill="currentColor"
                  />
                  <div
                    className="absolute top-0 left-0 overflow-hidden"
                    style={{ width: `${(rating - (starValue - 1)) * 100}%` }}
                  >
                    <Star
                      size={size}
                      className="text-yellow-400"
                      fill="currentColor"
                    />
                  </div>
                </div>
              ) : (
                <Star
                  size={size}
                  className={`transition-colors duration-200 ${
                    isFilled
                      ? 'text-yellow-400 fill-current'
                      : readonly
                        ? 'text-gray-300'
                        : 'text-gray-300 hover:text-yellow-300'
                  }`}
                  fill={isFilled ? "currentColor" : "none"}
                />
              )}
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="ml-2 text-sm text-gray-600 font-medium">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
