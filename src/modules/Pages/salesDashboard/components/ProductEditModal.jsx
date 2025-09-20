import React, { useState, useEffect } from "react";
import { FaTimes, FaSave, FaSpinner } from "react-icons/fa";
import { formatNumberWithCommas } from "../../../../lib/helper";

const ProductEditModal = ({
  product,
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    vendor_id: product?.vendor_id || "",
    name: product?.name || "",
    description: "",
    price: "",
    original_price: "",
    sku: "",
    status: "PUBLISHED",
    gender: "unisex",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({
        vendor_id: product.vendor_id || "",
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        original_price: product.original_price || "",
        sku: product.sku || "",
        status: product.status || "PUBLISHED",
        gender: product.gender || "unisex",
      });
    }
  }, [product]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.price) {
      newErrors.price = "Price is required";
    } else if (isNaN(formData.price) || parseFloat(formData.price) < 0) {
      newErrors.price = "Price must be a valid positive number";
    }

    if (
      formData.original_price &&
      (isNaN(formData.original_price) ||
        parseFloat(formData.original_price) < 0)
    ) {
      newErrors.original_price =
        "Original price must be a valid positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const updatedData = {
      ...formData,
      price: parseFloat(formData.price),
      original_price: formData.original_price
        ? parseFloat(formData.original_price)
        : null,
    };

    onSave(updatedData);
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!isOpen || !product) return null;

  const getProductType = () => {
    if (product.fabric) return "Fabric";
    if (product.style) return "Style";
    return "Product";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      ></div>

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Edit {getProductType()}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Update product information
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              disabled={isLoading}
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter product name"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter product description"
                disabled={isLoading}
              />
            </div>

            {/* Price Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Current Price */}
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Current Price (₦) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.price ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  disabled={isLoading}
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-500">{errors.price}</p>
                )}
              </div>

              {/* Original Price */}
              <div>
                <label
                  htmlFor="original_price"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Original Price (₦)
                </label>
                <input
                  type="number"
                  id="original_price"
                  name="original_price"
                  value={formData.original_price}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.original_price ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  disabled={isLoading}
                />
                {errors.original_price && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.original_price}
                  </p>
                )}
              </div>
            </div>

            {/* SKU and Status Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* SKU */}
              <div>
                <label
                  htmlFor="sku"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  SKU
                </label>
                <input
                  type="text"
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter SKU"
                  disabled={isLoading}
                />
              </div>

              {/* Status */}
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isLoading}
                >
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>

            {/* Gender */}
            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isLoading}
              >
                <option value="unisex">Unisex</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            {/* Price Preview */}
            {formData.price && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Price Preview
                </h4>
                <div className="flex items-center space-x-4">
                  <div>
                    <span className="text-lg font-bold text-gray-900">
                      ₦{formatNumberWithCommas(formData.price)}
                    </span>
                    <span className="text-sm text-gray-600 ml-2">
                      Current Price
                    </span>
                  </div>
                  {formData.original_price &&
                    formData.original_price !== formData.price && (
                      <div>
                        <span className="text-sm text-gray-500 line-through">
                          ₦{formatNumberWithCommas(formData.original_price)}
                        </span>
                        <span className="text-sm text-gray-600 ml-2">
                          Original Price
                        </span>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductEditModal;
