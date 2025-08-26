import React from "react";
import { Trash2, Scissors, Package, Palette } from "lucide-react";
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
    item.product?.fabric?.photos?.[0] ||
    "/default-product.png";

  // Get style image
  const styleImage = item.style_product?.style?.photos?.[0] || null;

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {/* Mobile Layout */}
        <div className="md:hidden p-4 space-y-3">
          {/* Fabric Section */}
          <div className="flex items-start gap-3">
            <img
              src={productImage}
              alt={item.product?.name || "Product"}
              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <Package className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                  FABRIC
                </span>
              </div>
              <button
                onClick={() => navigate(`/shop-details/${item.product_id}`)}
                className="font-semibold text-base text-gray-900 hover:text-purple-600 transition-colors text-left"
              >
                {item.product?.name || `Product ${item.product_id}`}
              </button>
              <p className="text-sm text-gray-600">
                Color: {item.color || "Red"}
              </p>
              <div className="text-sm text-gray-600 mt-1">
                Qty: <span className="font-medium">{quantity}</span> • Price:{" "}
                <span className="font-medium">
                  ₦{fabricPrice.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="font-bold text-blue-600 text-sm">
                  ₦{fabricTotal.toLocaleString()}
                </div>
              </div>
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

          {/* Style Section */}
          {item.style_product && (
            <>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-start gap-3">
                  {styleImage && (
                    <img
                      src={styleImage}
                      alt={item.style_product?.name || "Style"}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                        <Scissors className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="text-xs font-medium text-purple-600 uppercase tracking-wide">
                        STYLE
                      </span>
                    </div>
                    <div className="font-semibold text-base text-gray-900">
                      {item.style_product?.name || "Custom Style"}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Measurements:{" "}
                      <span className="font-medium">{measurementCount}</span> •
                      Price:{" "}
                      <span className="font-medium">
                        ₦{stylePrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-purple-600 text-sm">
                      ₦{stylePrice.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Total Section */}
          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
            <div className="font-medium text-gray-900">Total Amount</div>
            <div className="font-bold text-green-600 text-lg">
              ₦{itemTotal.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block p-6 relative">
          <div className="grid grid-cols-12 gap-4">
            {/* Image Column */}
            <div className="col-span-2">
              <img
                src={productImage}
                alt={item.product?.name || "Product"}
                className="w-full h-20 object-cover rounded-lg"
              />
            </div>

            {/* Product Info Column */}
            <div className="col-span-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <Package className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                  FABRIC
                </span>
              </div>
              <button
                onClick={() => navigate(`/shop-details/${item.product_id}`)}
                className="font-semibold text-base text-gray-900 hover:text-purple-600 transition-colors text-left block mb-1"
              >
                {item.product?.name || `Product ${item.product_id}`}
              </button>
              <p className="text-sm text-gray-600">
                Color: {item.color || "Red"}
              </p>
            </div>

            {/* Quantity Column */}
            <div className="col-span-2 text-center">
              <div className="text-xs text-gray-500 mb-1">Yards</div>
              <div className="font-medium text-gray-900">{quantity}</div>
            </div>

            {/* Unit Price Column */}
            <div className="col-span-2 text-center">
              <div className="text-xs text-gray-500 mb-1">Unit Price</div>
              <div className="font-medium text-gray-900">
                ₦{fabricPrice.toLocaleString()}
              </div>
            </div>

            {/* Total Column */}
            <div className="col-span-2 text-center">
              <div className="text-xs text-gray-500 mb-1">Fabric Total</div>
              <div className="font-bold text-blue-600">
                ₦{fabricTotal.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Style Section */}
          {item.style_product && (
            <div className="border-t border-gray-200 mt-4 pt-4">
              <div className="grid grid-cols-12 gap-4">
                {/* Style Image Column */}
                <div className="col-span-2">
                  {styleImage && (
                    <img
                      src={styleImage}
                      alt={item.style_product?.name || "Style"}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                  )}
                </div>

                {/* Style Info Column */}
                <div className="col-span-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                      <Scissors className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="text-xs font-medium text-purple-600 uppercase tracking-wide">
                      STYLE
                    </span>
                  </div>
                  <div className="font-semibold text-base text-gray-900 mb-1">
                    {item.style_product?.name || "Custom Style"}
                  </div>
                </div>

                {/* Measurements Column */}
                <div className="col-span-2 text-center">
                  <div className="text-xs text-gray-500 mb-1">Measurements</div>
                  <div className="font-medium text-gray-900">
                    {measurementCount}
                  </div>
                </div>

                {/* Style Price Column */}
                <div className="col-span-2 text-center">
                  <div className="text-xs text-gray-500 mb-1">Style Price</div>
                  <div className="font-medium text-gray-900">
                    ₦{stylePrice.toLocaleString()}
                  </div>
                </div>

                {/* Style Total Column */}
                <div className="col-span-2 text-center">
                  <div className="text-xs text-gray-500 mb-1">Style Total</div>
                  <div className="font-bold text-purple-600">
                    ₦{(stylePrice * measurementCount).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delete Button and Total Section */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex justify-between items-center">
              <button
                onClick={() => onDelete(item.id)}
                disabled={deleteIsPending}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                title="Remove item"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm">Remove</span>
              </button>
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Item Total</div>
                <div className="font-bold text-green-600 text-xl">
                  ₦{itemTotal.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartItemWithBreakdown;
