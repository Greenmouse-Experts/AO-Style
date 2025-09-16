import React from "react";
import {
  FaTimes,
  FaEdit,
  FaTrash,
  FaBox,
  FaTag,
  FaDollarSign,
  FaClock,
  FaRuler,
  FaWeight,
} from "react-icons/fa";
import { formatNumberWithCommas, formatDateStr } from "../../../../lib/helper";

const ProductViewModal = ({ product, isOpen, onClose, onEdit, onDelete }) => {
  if (!isOpen || !product) return null;

  const getProductImage = () => {
    if (product.fabric?.photos?.length > 0) return product.fabric.photos[0];
    if (product.style?.photos?.length > 0) return product.style.photos[0];
    if (product.photos?.length > 0) return product.photos[0];
    if (typeof product.photos === "string") return product.photos;
    if (product.image_url) return product.image_url;
    if (product.thumbnail) return product.thumbnail;
    return "https://via.placeholder.com/400x300?text=No+Image";
  };

  const getProductType = () => {
    if (product.fabric)
      return {
        type: "Fabric",
        icon: <FaBox className="w-5 h-5" />,
        color: "bg-purple-100 text-purple-800",
      };
    if (product.style)
      return {
        type: "Style",
        icon: <FaTag className="w-5 h-5" />,
        color: "bg-purple-200 text-purple-900",
      };
    return {
      type: "Product",
      icon: <FaBox className="w-5 h-5" />,
      color: "bg-purple-50 text-purple-700",
    };
  };

  const productType = getProductType();

  const renderFabricDetails = () => {
    if (!product.fabric) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center">
            <FaBox className="w-4 h-4 text-purple-400 mr-2" />
            <span className="text-sm text-purple-700">Material:</span>
            <span className="ml-2 text-sm font-medium">
              {product.fabric.material_type || "N/A"}
            </span>
          </div>
          <div className="flex items-center">
            <FaRuler className="w-4 h-4 text-purple-400 mr-2" />
            <span className="text-sm text-purple-700">Quantity:</span>
            <span className="ml-2 text-sm font-medium">
              {product.fabric.quantity || "N/A"} yard(s)
            </span>
          </div>
          <div className="flex items-center">
            <FaWeight className="w-4 h-4 text-purple-400 mr-2" />
            <span className="text-sm text-purple-700">Weight per unit:</span>
            <span className="ml-2 text-sm font-medium">
              {product.fabric.weight_per_unit || "N/A"}
            </span>
          </div>
          <div className="flex items-center">
            <FaTag className="w-4 h-4 text-purple-400 mr-2" />
            <span className="text-sm text-purple-700">Local Name:</span>
            <span className="ml-2 text-sm font-medium">
              {product.fabric.local_name || "N/A"}
            </span>
          </div>
          <div className="flex items-center">
            <FaTag className="w-4 h-4 text-purple-400 mr-2" />
            <span className="text-sm text-purple-700">Manufacturer:</span>
            <span className="ml-2 text-sm font-medium">
              {product.fabric.manufacturer_name ||
                product.fabric.manufacturer ||
                "N/A"}
            </span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center">
            <FaRuler className="w-4 h-4 text-purple-400 mr-2" />
            <span className="text-sm text-purple-700">Min Yards:</span>
            <span className="ml-2 text-sm font-medium">
              {product.fabric.minimum_yards || "N/A"}
            </span>
          </div>
          {product.fabric.feel_a_like &&
            product.fabric.feel_a_like.trim() !== "" && (
              <div className="flex items-center">
                <FaTag className="w-4 h-4 text-purple-400 mr-2" />
                <span className="text-sm text-purple-700">Feel:</span>
                <span className="ml-2 text-sm font-medium">
                  {product.fabric.feel_a_like}
                </span>
              </div>
            )}
          <div className="flex items-center">
            <FaTag className="w-4 h-4 text-purple-400 mr-2" />
            <span className="text-sm text-purple-700">Texture:</span>
            <span className="ml-2 text-sm font-medium">
              {product.fabric.fabric_texture || "N/A"}
            </span>
          </div>
          <div className="flex items-start">
            <FaTag className="w-4 h-4 text-purple-400 mr-2 mt-1" />
            <span className="text-sm text-purple-700 mt-1">
              Available Colors:
            </span>
            <span className="ml-2 text-sm font-medium flex flex-wrap gap-2">
              {Array.isArray(product.fabric.available_colors) &&
              product.fabric.available_colors.length > 0
                ? product.fabric.available_colors.map((color, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-0.5 rounded-full border border-purple-200 bg-purple-50 text-purple-800 text-xs"
                    >
                      <span
                        className="inline-block w-4 h-4 rounded-full mr-1 border border-gray-200"
                        style={{
                          backgroundColor: color,
                        }}
                        title={color}
                      ></span>
                      {color}
                    </span>
                  ))
                : typeof product.fabric.available_colors === "string" &&
                    product.fabric.available_colors.trim() !== ""
                  ? product.fabric.available_colors
                      .split(",")
                      .map((color, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-0.5 rounded-full border border-purple-200 bg-purple-50 text-purple-800 text-xs"
                        >
                          <span
                            className="inline-block w-4 h-4 rounded-full mr-1 border border-gray-200"
                            style={{
                              backgroundColor: color.trim(),
                            }}
                            title={color.trim()}
                          ></span>
                          {color.trim()}
                        </span>
                      ))
                  : "N/A"}
            </span>
          </div>
          <div className="flex items-start">
            <FaTag className="w-4 h-4 text-purple-400 mr-2 mt-1" />
            <span className="text-sm text-purple-700 mt-1">Fabric Colors:</span>
            <span className="ml-2 text-sm font-medium flex flex-wrap gap-2">
              {Array.isArray(product.fabric.fabric_colors) &&
              product.fabric.fabric_colors.length > 0
                ? product.fabric.fabric_colors.map((color, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-0.5 rounded-full border border-purple-200 bg-purple-50 text-purple-800 text-xs"
                    >
                      <span
                        className="inline-block w-4 h-4 rounded-full mr-1 border border-gray-200"
                        style={{
                          backgroundColor: color,
                        }}
                        title={color}
                      ></span>
                      {color}
                    </span>
                  ))
                : typeof product.fabric.fabric_colors === "string" &&
                    product.fabric.fabric_colors.trim() !== ""
                  ? product.fabric.fabric_colors
                      .split(",")
                      .map((color, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-0.5 rounded-full border border-purple-200 bg-purple-50 text-purple-800 text-xs"
                        >
                          <span
                            className="inline-block w-4 h-4 rounded-full mr-1 border border-gray-200"
                            style={{
                              backgroundColor: color.trim(),
                            }}
                            title={color.trim()}
                          ></span>
                          {color.trim()}
                        </span>
                      ))
                  : "N/A"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderStyleDetails = () => {
    if (!product.style) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center">
            <FaClock className="w-4 h-4 text-purple-400 mr-2" />
            <span className="text-sm text-purple-700">Sewing Time:</span>
            <span className="ml-2 text-sm font-medium">
              {product.style.estimated_sewing_time || "N/A"}h
            </span>
          </div>
          <div className="flex items-center">
            <FaRuler className="w-4 h-4 text-purple-400 mr-2" />
            <span className="text-sm text-purple-700">Min Fabric Qty:</span>
            <span className="ml-2 text-sm font-medium">
              {product.style.minimum_fabric_qty || "N/A"} yards
            </span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center">
            <FaTag className="w-4 h-4 text-purple-400 mr-2" />
            <span className="text-sm text-purple-700">Difficulty:</span>
            <span className="ml-2 text-sm font-medium">
              {product.style.difficulty_level || "N/A"}
            </span>
          </div>
          <div className="flex items-center">
            <FaBox className="w-4 h-4 text-purple-400 mr-2" />
            <span className="text-sm text-purple-700">Fit Type:</span>
            <span className="ml-2 text-sm font-medium">
              {product.style.fit_type || "N/A"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderGeneralDetails = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center">
            <FaTag className="w-4 h-4 text-purple-400 mr-2" />
            <span className="text-sm text-purple-700">SKU:</span>
            <span className="ml-2 text-sm font-medium">
              {product.sku || "N/A"}
            </span>
          </div>
          <div className="flex items-center">
            <FaBox className="w-4 h-4 text-purple-400 mr-2" />
            <span className="text-sm text-purple-700">Category:</span>
            <span className="ml-2 text-sm font-medium">
              {product.category?.name || "N/A"}
            </span>
          </div>
          <div className="flex items-center">
            <FaTag className="w-4 h-4 text-purple-400 mr-2" />
            <span className="text-sm text-purple-700">Type:</span>
            <span className="ml-2 text-sm font-medium">
              {product.type || "N/A"}
            </span>
          </div>
          <div className="flex items-center">
            <FaTag className="w-4 h-4 text-purple-400 mr-2" />
            <span className="text-sm text-purple-700">Tags:</span>
            <span className="ml-2 text-sm font-medium">
              {Array.isArray(product.tags) && product.tags.length > 0
                ? product.tags.join(", ")
                : "N/A"}
            </span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center">
            <FaBox className="w-4 h-4 text-purple-400 mr-2" />
            <span className="text-sm text-purple-700">Market:</span>
            <span className="ml-2 text-sm font-medium">
              {product.market_place?.name ||
                product.fabric?.market_place?.name ||
                "N/A"}
            </span>
          </div>
          <div className="flex items-center">
            <FaClock className="w-4 h-4 text-purple-400 mr-2" />
            <span className="text-sm text-purple-700">Created:</span>
            <span className="ml-2 text-sm font-medium">
              {product.created_at
                ? formatDateStr(product.created_at.split("T")[0])
                : "N/A"}
            </span>
          </div>
          <div className="flex items-center">
            <FaTag className="w-4 h-4 text-purple-400 mr-2" />
            <span className="text-sm text-purple-700">Currency:</span>
            <span className="ml-2 text-sm font-medium">
              {product.currency || "N/A"}
            </span>
          </div>
          <div className="flex items-center">
            <FaTag className="w-4 h-4 text-purple-400 mr-2" />
            <span className="text-sm text-purple-700">Approval Status:</span>
            <span className="ml-2 text-sm font-medium">
              {product.approval_status || "N/A"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderLocationDetails = () => {
    const location =
      product.fabric?.location ||
      product.style?.location ||
      product.location ||
      null;
    if (!location) return null;
    return (
      <div className="mt-2">
        <h4 className="text-lg font-medium text-purple-900 mb-2">Location</h4>
        <div className="p-3 bg-purple-50 rounded-lg">
          <div className="text-sm">
            <strong>Latitude:</strong> {location.latitude || "N/A"}
          </div>
          <div className="text-sm">
            <strong>Longitude:</strong> {location.longitude || "N/A"}
          </div>
        </div>
      </div>
    );
  };

  const renderBusinessInfo = () => {
    if (!product.business_info) return null;
    return (
      <div className="mt-2">
        {/* <h4 className="text-lg font-medium text-purple-900 mb-2">
          Business Info
        </h4>
        <div className="p-3 bg-purple-50 rounded-lg">
          <div className="text-sm">
            <strong>Business Name:</strong>{" "}
            {product.business_info.business_name || "N/A"}
          </div>
          <div className="text-sm">
            <strong>Email:</strong> {product.business_info.email || "N/A"}
          </div>
        </div>*/}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-6">
      <div
        className="fixed inset-0 bg-black bg-opacity-60 transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-6xl max-h-[95vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-purple-200">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
              <div
                className={`inline-flex items-center px-4 py-1 rounded-full text-base font-semibold ${productType.color} border border-purple-200`}
              >
                {productType.icon}
                <span className="ml-2">{productType.type}</span>
              </div>
              <h3 className="text-2xl font-bold text-purple-900">
                {product.name || "Unnamed Product"}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-purple-400 hover:text-purple-700 hover:bg-purple-100 rounded-full transition-colors"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Image Section */}
            <div className="space-y-6">
              <div className="aspect-w-16 aspect-h-12">
                <img
                  src={getProductImage()}
                  alt={product.name || "Product"}
                  className="w-full h-72 object-cover rounded-xl shadow-md border border-purple-100"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/400x300?text=No+Image";
                  }}
                />
              </div>

              {/* Price and Status */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-purple-50 rounded-xl border border-purple-100">
                <div className="flex items-center space-x-3">
                  <FaDollarSign className="w-6 h-6 text-purple-700" />
                  <div>
                    <div className="text-3xl font-extrabold text-purple-900">
                      ₦
                      {formatNumberWithCommas(
                        product.price || product.original_price || 0,
                      )}
                    </div>
                    {product.original_price &&
                      product.price !== product.original_price && (
                        <div className="text-base text-purple-400 line-through">
                          ₦{formatNumberWithCommas(product.original_price)}
                        </div>
                      )}
                  </div>
                </div>
                <div className="mt-3 sm:mt-0">
                  <span
                    className={`inline-flex px-4 py-1 text-base font-semibold rounded-full border ${
                      product.status === "PUBLISHED"
                        ? "bg-purple-100 text-purple-800 border-purple-200"
                        : "bg-yellow-100 text-yellow-800 border-yellow-200"
                    }`}
                  >
                    {product.status || "Draft"}
                  </span>
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-8">
              {/* Description */}
              {product.description && (
                <div>
                  <h4 className="text-xl font-semibold text-purple-900 mb-2">
                    Description
                  </h4>
                  <p className="text-purple-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Basic Info */}
              <div>
                <h4 className="text-xl font-semibold text-purple-900 mb-3">
                  Basic Information
                </h4>
                {renderGeneralDetails()}
              </div>

              {/* Specific Details */}
              {product.fabric && (
                <div>
                  <h4 className="text-xl font-semibold text-purple-900 mb-3">
                    Fabric Details
                  </h4>
                  {renderFabricDetails()}
                </div>
              )}

              {product.style && (
                <div>
                  <h4 className="text-xl font-semibold text-purple-900 mb-3">
                    Style Details
                  </h4>
                  {renderStyleDetails()}
                </div>
              )}

              {/* Location Info */}
              {renderLocationDetails()}

              {/* Business Info */}
              {renderBusinessInfo()}

              {/* Creator Info */}
              {product.creator && (
                <div>
                  <h4 className="text-xl font-semibold text-purple-900 mb-3">
                    Creator Information
                  </h4>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="text-sm">
                      <strong>Name:</strong> {product.creator.name || "N/A"}
                    </div>
                    {product.creator.email && (
                      <div className="text-sm text-purple-700 mt-1">
                        <strong>Email:</strong> {product.creator.email}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row items-center justify-end space-y-3 md:space-y-0 md:space-x-4 mt-10 pt-8 border-t border-purple-200">
            <button
              onClick={onClose}
              className="px-5 py-2 text-base font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => onEdit(product)}
              className="inline-flex items-center px-5 py-2 text-base font-medium text-white bg-purple-700 rounded-lg hover:bg-purple-800 transition-colors"
            >
              <FaEdit className="w-5 h-5 mr-2" />
              Edit Product
            </button>
            <button
              onClick={() => onDelete(product)}
              className="inline-flex items-center px-5 py-2 text-base font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              <FaTrash className="w-5 h-5 mr-2" />
              Delete Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductViewModal;
