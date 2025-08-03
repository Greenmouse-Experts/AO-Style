import React from 'react';
import { Star } from 'lucide-react';
import useGetProductAverageRating from '../../hooks/reviews/useGetProductAverageRating';

const ProductRatingBadge = ({
  productId,
  size = 'sm',
  showText = true,
  className = ""
}) => {
  const { averageRating, totalReviews, isLoading } = useGetProductAverageRating(productId);

  if (isLoading || !productId) {
    return null;
  }

  if (totalReviews === 0) {
    return (
      <div className={`flex items-center gap-1 text-gray-400 ${className}`}>
        <Star size={size === 'sm' ? 14 : 16} />
        {showText && (
          <span className={`${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
            No reviews
          </span>
        )}
      </div>
    );
  }

  const sizeClasses = {
    sm: {
      star: 14,
      text: 'text-xs',
      gap: 'gap-1'
    },
    md: {
      star: 16,
      text: 'text-sm',
      gap: 'gap-1.5'
    }
  };

  const currentSize = sizeClasses[size] || sizeClasses.sm;

  return (
    <div className={`flex items-center ${currentSize.gap} ${className}`}>
      <div className="flex items-center">
        <Star
          size={currentSize.star}
          className="text-yellow-400 fill-current"
        />
        <span className={`ml-1 font-medium text-gray-900 ${currentSize.text}`}>
          {averageRating.toFixed(1)}
        </span>
      </div>

      {showText && (
        <span className={`text-gray-500 ${currentSize.text}`}>
          ({totalReviews})
        </span>
      )}
    </div>
  );
};

export default ProductRatingBadge;
