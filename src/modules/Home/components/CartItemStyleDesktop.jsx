import React from "react";

const CartItemStyleDesktop = ({
  styleProduct,
  measurement,
  fabricImage,
  fabricName,
  stylePrice,
}) => {
  if (!styleProduct) {
    return null;
  }

  return (
    <div className="mt-1 p-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
      <div className="flex items-center justify-between">
        {/* Style Info */}
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">S</span>
          </div>
          {styleProduct?.style?.photos?.[0] || styleProduct?.photos?.[0] ? (
            <img
              src={
                styleProduct?.style?.photos?.[0] || styleProduct?.photos?.[0]
              }
              alt="Selected style"
              className="w-6 h-6 object-cover rounded border-2 border-purple-100"
            />
          ) : null}
          <div>
            <p className="text-xs font-medium text-purple-700">
              {styleProduct?.name || "Custom Style"}
            </p>
            <p className="text-xs text-purple-500">Style</p>
            {stylePrice && parseFloat(stylePrice) > 0 && (
              <p className="text-xs font-medium text-purple-600">
                +₦{parseFloat(stylePrice).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Measurement Badge */}
        {measurement && (
          <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 rounded-full">
            <span className="text-xs font-bold text-green-600">
              {Array.isArray(measurement)
                ? measurement.length
                : measurement
                  ? 1
                  : 0}
            </span>
            <span className="text-xs font-medium text-green-700">
              Measurement
              {(Array.isArray(measurement)
                ? measurement.length
                : measurement
                  ? 1
                  : 0) !== 1
                ? "s"
                : ""}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartItemStyleDesktop;
