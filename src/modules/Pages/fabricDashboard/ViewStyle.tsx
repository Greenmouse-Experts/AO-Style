import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Calendar,
  User,
  ShoppingBag,
  Eye,
  Star,
  MapPin,
  Heart,
  Share2,
  Palette,
  Info,
  BadgeCheck,
  Clock,
  DollarSign,
  Grid3X3,
  Tag,
  Ruler,
  Shirt,
} from "lucide-react";

export default function ViewFabricProduct() {
  const location = useLocation();
  const navigate = useNavigate();
  const productData = location.state?.info;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  if (!productData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The product information could not be loaded.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const images = productData?.fabric?.photos || [];
  const hasImages = images.length > 0;

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PUBLISHED":
        return "bg-green-100 text-green-800 border-green-200";
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "ARCHIVED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const formatPrice = (price: any) => {
    if (!price) return "N/A";
    if (typeof price === "string" && price.includes("₦")) {
      return price;
    }
    return `₦${String(price)}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: productData.name || "Product",
        text: `Check out this fabric: ${productData.name || "Product"}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Product Details
                </h1>
                <p className="text-sm text-gray-500">
                  {String(productData.name || "Product")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images Section */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200">
              {hasImages ? (
                <img
                  src={images[selectedImageIndex]}
                  alt={String(productData.name || "Product")}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
                  <div className="text-center text-white">
                    <Package className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-2xl font-bold">
                      {productData.name?.charAt(0)?.toUpperCase() || "?"}
                    </p>
                    <p className="text-sm opacity-90">No Image Available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {hasImages && images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? "border-purple-500 shadow-lg"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${String(productData.name || "Product")} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {String(productData.name || "Untitled Product")}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Grid3X3 className="w-4 h-4 mr-1" />
                      SKU: {String(productData.sku || "N/A")}
                    </span>
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {String(productData.type || "FABRIC")}
                    </span>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center ${getStatusColor(productData.status)}`}
                >
                  <BadgeCheck className="w-4 h-4 mr-1" />
                  {String(productData.status || "Draft")}
                </span>
              </div>

              <div className="flex items-baseline space-x-4 mb-6">
                <div className="text-4xl font-bold text-purple-600">
                  {formatPrice(productData.price || productData.original_price)}
                </div>
                {productData.original_price &&
                  productData.price &&
                  productData.original_price !== productData.price && (
                    <div className="text-lg text-gray-500 line-through">
                      {formatPrice(productData.original_price)}
                    </div>
                  )}
                <span className="text-sm text-gray-500">per unit</span>
              </div>

              {productData.description && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Info className="w-5 h-5 mr-2" />
                    Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {String(productData.description)}
                  </p>
                </div>
              )}
            </div>

            {/* Fabric Details */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Fabric Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Shirt className="w-5 h-5 text-purple-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Type</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {String(
                          productData.fabric?.type ||
                            productData.fabric_type ||
                            "Cotton",
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-purple-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Gender
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {String(
                          productData.fabric?.gender ||
                            productData.fabric_gender ||
                            "Unisex",
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Tag className="w-5 h-5 text-purple-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Category
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {String(
                          productData.category?.name ||
                            productData.category ||
                            "N/A",
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Package className="w-5 h-5 text-purple-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Stock</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {String(
                          productData.qty ||
                            productData.fabric?.quantity ||
                            "0 units",
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Ruler className="w-5 h-5 text-purple-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Weight
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {String(productData.fabric?.weight_per_unit || "N/A")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-purple-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Currency
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {String(productData.currency || "NGN")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Business & Creator Info */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Business Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Business Name
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {String(
                        productData.business_name ||
                          productData.creator?.name ||
                          "N/A",
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Created By
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {String(
                        productData.creator_name ||
                          productData.creator?.name ||
                          "Admin",
                      )}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Market ID
                    </p>
                    <p className="text-lg font-semibold text-gray-900 font-mono text-sm">
                      {String(
                        productData.market_id ||
                          productData.fabric?.market_id ||
                          "N/A",
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Fabric ID
                    </p>
                    <p className="text-lg font-semibold text-gray-900 font-mono text-sm">
                      {String(
                        productData.fabric_id ||
                          productData.fabric?.id ||
                          "N/A",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Additional Information
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Date Created
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatDate(productData.created_at)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600 flex items-center">
                    <Package className="w-4 h-4 mr-2" />
                    Product ID
                  </span>
                  <span className="font-medium text-gray-900 font-mono text-sm">
                    {String(productData.id || "N/A")}
                  </span>
                </div>

                {productData.published_at && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600 flex items-center">
                      <BadgeCheck className="w-4 h-4 mr-2" />
                      Published Date
                    </span>
                    <span className="font-medium text-gray-900">
                      {formatDate(productData.published_at)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600 flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    Status
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(productData.status)}`}
                  >
                    {String(productData.status || "Draft")}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-center">
              <button
                onClick={() => navigate("/fabric/products")}
                className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-8 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Back to Products</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
