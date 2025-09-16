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
        color: "bg-blue-100 text-blue-800",
      };
    if (product.style)
      return {
        type: "Style",
        icon: <FaTag className="w-5 h-5" />,
        color: "bg-purple-100 text-purple-800",
      };
    return {
      type: "Product",
      icon: <FaBox className="w-5 h-5" />,
      color: "bg-gray-100 text-gray-800",
    };
  };

  const productType = getProductType();

  const renderFabricDetails = () => {
    if (!product.fabric) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center">
            <FaBox className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">Material:</span>
            <span className="ml-2 text-sm font-medium">
              {product.fabric.material_type || "N/A"}
            </span>
          </div>
          <div className="flex items-center">
            <FaRuler className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">Quantity:</span>
            <span className="ml-2 text-sm font-medium">
              {product.quantity || "N/A"} yards
            </span>
          </div>
          <div className="flex items-center">
            <FaWeight className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">Weight per unit:</span>
            <span className="ml-2 text-sm font-medium">
              {product.fabric.weight_per_unit || "N/A"}
            </span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center">
            <FaRuler className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">Min Yards:</span>
            <span className="ml-2 text-sm font-medium">
              {product.fabric.minimum_yards || "N/A"}
            </span>
          </div>
          <div className="flex items-center">
            <FaTag className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">Feel:</span>
            <span className="ml-2 text-sm font-medium">
              {product.fabric.feel_a_like || "N/A"}
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
            <FaClock className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">Sewing Time:</span>
            <span className="ml-2 text-sm font-medium">
              {product.style.estimated_sewing_time || "N/A"}h
            </span>
          </div>
          <div className="flex items-center">
            <FaRuler className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">Min Fabric Qty:</span>
            <span className="ml-2 text-sm font-medium">
              {product.style.minimum_fabric_qty || "N/A"} yards
            </span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center">
            <FaTag className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">Difficulty:</span>
            <span className="ml-2 text-sm font-medium">
              {product.style.difficulty_level || "N/A"}
            </span>
          </div>
          <div className="flex items-center">
            <FaBox className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">Fit Type:</span>
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
            <FaTag className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">SKU:</span>
            <span className="ml-2 text-sm font-medium">
              {product.sku || "N/A"}
            </span>
          </div>
          <div className="flex items-center">
            <FaBox className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">Category:</span>
            <span className="ml-2 text-sm font-medium">
              {product.category?.name || "N/A"}
            </span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center">
            <FaBox className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">Market:</span>
            <span className="ml-2 text-sm font-medium">
              {product.market_place?.name || "N/A"}
            </span>
          </div>
          <div className="flex items-center">
            <FaClock className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">Created:</span>
            <span className="ml-2 text-sm font-medium">
              {product.created_at
                ? formatDateStr(product.created_at.split("T")[0])
                : "N/A"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${productType.color}`}
              >
                {productType.icon}
                <span className="ml-2">{productType.type}</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {product.name || "Unnamed Product"}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Section */}
            <div className="space-y-4">
              <div className="aspect-w-16 aspect-h-12">
                <img
                  src={getProductImage()}
                  alt={product.name || "Product"}
                  className="w-full h-64 object-cover rounded-lg shadow-sm"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/400x300?text=No+Image";
                  }}
                />
              </div>

              {/* Price and Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FaDollarSign className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      ₦
                      {formatNumberWithCommas(
                        product.price || product.original_price || 0,
                      )}
                    </div>
                    {product.original_price &&
                      product.price !== product.original_price && (
                        <div className="text-sm text-gray-500 line-through">
                          ₦{formatNumberWithCommas(product.original_price)}
                        </div>
                      )}
                  </div>
                </div>
                <div>
                  <span
                    className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      product.status === "PUBLISHED"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {product.status || "Draft"}
                  </span>
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              {/* Description */}
              {product.description && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Description
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Basic Info */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">
                  Basic Information
                </h4>
                {renderGeneralDetails()}
              </div>

              {/* Specific Details */}
              {product.fabric && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    Fabric Details
                  </h4>
                  {renderFabricDetails()}
                </div>
              )}

              {product.style && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    Style Details
                  </h4>
                  {renderStyleDetails()}
                </div>
              )}

              {/* Creator Info */}
              {product.creator && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    Creator Information
                  </h4>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm">
                      <strong>Name:</strong> {product.creator.name || "N/A"}
                    </div>
                    {product.creator.email && (
                      <div className="text-sm text-gray-600 mt-1">
                        <strong>Email:</strong> {product.creator.email}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => onEdit(product)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              <FaEdit className="w-4 h-4 mr-2" />
              Edit Product
            </button>
            <button
              onClick={() => onDelete(product)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
            >
              <FaTrash className="w-4 h-4 mr-2" />
              Delete Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductViewModal;
