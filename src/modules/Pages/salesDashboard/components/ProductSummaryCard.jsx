import React from "react";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaBox,
  FaTag,
  FaDollarSign,
} from "react-icons/fa";
import { formatNumberWithCommas } from "../../../../lib/helper";

const ProductSummaryCard = ({ product, onView, onEdit, onDelete }) => {
  if (!product) return null;

  const getProductImage = () => {
    if (product.fabric?.photos?.length > 0) return product.fabric.photos[0];
    if (product.style?.photos?.length > 0) return product.style.photos[0];
    if (product.photos?.length > 0) return product.photos[0];
    return "https://via.placeholder.com/300x200?text=No+Image";
  };

  const getProductType = () => {
    if (product.fabric) return "Fabric";
    if (product.style) return "Style";
    return "Product";
  };

  const getProductSpecificInfo = () => {
    if (product.fabric) {
      return {
        type: "Fabric",
        icon: <FaBox className="w-4 h-4" />,
        color: "bg-blue-100 text-blue-800",
        details: [
          { label: "Material", value: product.fabric.material_type || "N/A" },
          { label: "Quantity", value: `${product.quantity || "N/A"} yards` },
          {
            label: "Min Order",
            value: `${product.fabric.minimum_yards || "N/A"} yards`,
          },
          { label: "Weight", value: product.fabric.weight_per_unit || "N/A" },
        ],
      };
    }
    if (product.style) {
      return {
        type: "Style",
        icon: <FaTag className="w-4 h-4" />,
        color: "bg-purple-100 text-purple-800",
        details: [
          { label: "SKU", value: product.sku || "N/A" },
          {
            label: "Sewing Time",
            value: `${product.style.estimated_sewing_time || "N/A"}h`,
          },
          {
            label: "Min Fabric",
            value: `${product.style.minimum_fabric_qty || "N/A"} yards`,
          },
        ],
      };
    }
    return {
      type: "Product",
      icon: <FaBox className="w-4 h-4" />,
      color: "bg-gray-100 text-gray-800",
      details: [
        { label: "SKU", value: product.sku || "N/A" },
        { label: "Status", value: product.status || "N/A" },
      ],
    };
  };

  const productInfo = getProductSpecificInfo();
  const hasDiscount =
    product.original_price && product.original_price !== product.price;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden group">
      {/* Product Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={getProductImage()}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
          }}
        />

        {/* Product Type Badge */}
        <div
          className={`absolute top-3 left-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${productInfo.color}`}
        >
          {productInfo.icon}
          <span className="ml-1">{productInfo.type}</span>
        </div>

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            SALE
          </div>
        )}

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2">
          <button
            onClick={() => onView(product)}
            className="p-2 bg-white text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
            title="View Product"
          >
            <FaEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(product)}
            className="p-2 bg-white text-green-600 rounded-full hover:bg-green-50 transition-colors"
            title="Edit Product"
          >
            <FaEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(product)}
            className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors"
            title="Delete Product"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4">
        {/* Product Name and Gender */}
        <div className="mb-3">
          <h3
            className="text-lg font-semibold text-gray-900 truncate"
            title={product.name}
          >
            {product.name}
          </h3>
          <p className="text-sm text-gray-600">
            {getProductType()} • {product.gender || "Unisex"}
          </p>
        </div>

        {/* Price */}
        <div className="mb-3">
          <div className="flex items-center space-x-2">
            <FaDollarSign className="w-4 h-4 text-green-600" />
            <span className="text-xl font-bold text-gray-900">
              ₦{formatNumberWithCommas(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                ₦{formatNumberWithCommas(product.original_price)}
              </span>
            )}
          </div>
        </div>

        {/* Product Specific Details */}
        <div className="space-y-2">
          {productInfo.details.map((detail, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-gray-600">{detail.label}:</span>
              <span className="text-gray-900 font-medium">{detail.value}</span>
            </div>
          ))}
        </div>

        {/* Description (if available) */}
        {product.description && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p
              className="text-sm text-gray-600 line-clamp-2"
              title={product.description}
            >
              {product.description}
            </p>
          </div>
        )}
      </div>

      {/* Footer with Status and Actions */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Active
        </span>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => onView(product)}
            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Quick View"
          >
            <FaEye className="w-3 h-3" />
          </button>
          <button
            onClick={() => onEdit(product)}
            className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
            title="Quick Edit"
          >
            <FaEdit className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductSummaryCard;
