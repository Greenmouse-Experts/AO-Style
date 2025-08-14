import React from "react";
import { Trash2, Scissors } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CartItemWithBreakdown = ({
  item,
  onDelete,
  deleteIsPending,
  getMeasurementCount,
}) => {
  const navigate = useNavigate();

  if (!item) return null;

  const fabricPrice = parseFloat(
    item.price_at_time || item.product?.price || 0,
  );
  const stylePrice = parseFloat(item.style_product?.price || 0);
  const quantity = parseInt(item.quantity || 1);
  const fabricTotal = fabricPrice * quantity;
  const itemTotal = fabricTotal + stylePrice;

  const measurementCount = getMeasurementCount
    ? getMeasurementCount(item.measurement)
    : Array.isArray(item.measurement)
      ? item.measurement.length
      : item.measurement
        ? 1
        : 0;

  // Get the first image from photos array or fallback to product.image
  const productImage =
    item.photos?.[0] ||
    item.product?.fabric.photos[0] ||
    "/default-product.png";

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {/* Mobile Layout */}
        <div className="md:hidden p-4 space-y-3">
          <div className="flex items-start gap-3">
            <img
              src={productImage}
              alt={item.product?.name || "Product"}
              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <button
                onClick={() => navigate(`/shop-details/${item.product_id}`)}
                className="font-semibold text-base text-gray-900 hover:text-purple-600 transition-colors text-left"
              >
                {item.product?.name || `Product ${item.product_id}`}
              </button>
              <p className="text-sm text-gray-600">
                Color: {item.color || "Red"}
              </p>
              {item.style_product && (
                <div className="mt-2 p-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-md border border-purple-200">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                      <Scissors className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-purple-600 uppercase tracking-wide">
                        STYLE SELECTED
                      </span>
                      <span className="text-sm font-semibold text-purple-800">
                        {item.style_product?.name || "Agbada Style Attire"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onDelete(item.id)}
                disabled={deleteIsPending}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                title="Delete item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <div className="text-sm text-gray-600">
              Qty: <span className="font-medium">{quantity}</span> • Price:{" "}
              <span className="font-medium">
                ₦{fabricPrice.toLocaleString()}
              </span>
            </div>
            <div className="font-bold text-purple-600 text-lg">
              ₦{itemTotal.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-12 items-center p-4 gap-4 relative">
          {/* Product Image and Name */}
          <div className="col-span-6 flex items-center gap-3">
            <img
              src={productImage}
              alt={item.product?.name || "Product"}
              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
            />
            <div className="min-w-0">
              <button
                onClick={() => navigate(`/shop-details/${item.product_id}`)}
                className="font-semibold text-base text-gray-900 hover:text-purple-600 transition-colors text-left truncate block w-full"
              >
                {item.product?.name || `Product ${item.product_id}`}
              </button>
              <p className="text-sm text-gray-600">
                Color: {item.color || "Red"}
              </p>
              {item.style_product && (
                <div className="mt-2 p-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-md border border-purple-200">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                      <Scissors className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-purple-600 uppercase tracking-wide">
                        STYLE SELECTED
                      </span>
                      <span className="text-sm font-semibold text-purple-800">
                        {item.style_product?.name || "Agbada Style Attire"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quantity */}
          <div className="col-span-2 text-center">
            <div className="font-medium text-gray-900">{quantity}</div>
          </div>

          {/* Price */}
          <div className="col-span-2 text-center">
            <div className="font-medium text-gray-900">
              ₦{fabricPrice.toLocaleString()}
            </div>
          </div>

          {/* Total Amount */}
          <div className="col-span-2 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="font-bold text-purple-600 text-lg">
                ₦{itemTotal.toLocaleString()}
              </div>
              <button
                onClick={() => onDelete(item.id)}
                disabled={deleteIsPending}
                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                title="Delete item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartItemWithBreakdown;
